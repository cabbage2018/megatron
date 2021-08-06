'use strict'

let profilingDictionary = new Map()
const mqtt = require('mqtt')
const {
  AttributeIds,
  OPCUAClient,
  TimestampsToReturn,
} = require('node-opcua')
let log4js = require('log4js')
let log = log4js.getLogger('routes::bridge')

function deliver(MqttsOptions, signalArray) {
  let deliverPromise = new Promise(async function (resolve, reject) {
		let client = mqtt.connect(MqttsOptions.url, MqttsOptions.options)	
		client.on('error', function (err) {
			log.error('mqtt connect #', err)
			client.end()
			reject(err)
		})	
		client.on('message', function (topic, message) {
			log.debug(`MQTTs deliver topic=${topic}, message=${message}`)
		})	
		client.on('connect', function () {
			client.subscribe(MqttsOptions.subscribeTopic)
			client.publish(MqttsOptions.publishTopic, JSON.stringify(signalArray), (err)=>{
				log.error(err)
				resolve(err)
			})	
			resolve('Connected mqtt successfully!')
		})
  })
  return deliverPromise
}

function acquire(spaceConfigure, bulksize = 1500, bulkMode = false) {
  let acquisitionPromise = new Promise(async function (resolve, reject) {
    let client = OPCUAClient.create({
      endpointMustExist: false
    })
    client.on("backoff", (retry, delay) => {
      profilingDictionary.set('backoff' + spaceConfigure.endpointUrl + retry + delay, "alarm, need human being inter-act")
    })
    client.on("error", (e) => {
      let r = e
      r.timestamp = new Date()
      profilingDictionary.set('client.error', r)
      reject(e)
    })
    await client.connect(spaceConfigure.endpointUrl)
    const session = await client.createSession()
    console.log(`${session} @ [${new Date().toISOString()}] "session created"`)
	
		try {
			let responseValues = [];
      if(bulkMode) {
        /*
          BE VERT CAREFUL ABOUT THE BULK SIZE
          EACH OPC UA SERVER HAS ITS OWN MAXIMUM DATA POINTS LIMIT
          FOR EXAMPLE BULK OF SIMOCODE = 130
        */
        const BULKSIZE = 1000;

				/// integrate all available data points
				var segmentValues = [];
        for(var i = 0; i < nodeIds.length / BULKSIZE; i += 1) {
          const start = i * BULKSIZE;
          const stop = (i === nodeIds.length / BULKSIZE) ? nodeIds.length : (i + 1) * BULKSIZE;
          var values = await session.readVariableValue(nodeids.slice(start, stop));
          segmentValues.push(values);
				}
				responseValues = integrate(spaceConfigure, segmentValues)
      } else {
        ///discrete reading
        for(var i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
					let resp = await session.readVariableValue(spaceConfigure.nodeIds[i].address)

					let example = {}
					example.value = resp.value
					example.unit = resp.unit
					example.quality = resp.qualityCode
					example.name = spaceConfigure.nodeIds[i].name
					example.internal_name = resp.address
					responseValues.push(example)					
					/// statistics on identification of each data point
					profilingDictionary.set(resp.address, new Date())
        }
      }
      log.debug(`updated ${responseValues.length} data points`)
      resolve(responseValues)
    }
    catch (err) {
      await session.close()
			await client.disconnect()						
			reject(err)
    }
    await session.close()
    await client.disconnect()
  })
  return acquisitionPromise
}

/** 
{
	"item_id": "20f82405-dceb-46ba-969c-d501ce86d683",>>
	"timestamp": "2021-03-19T04:21:35+01",>>
	"count": 69,
	"total": 69,
	"_embedded": {
		"item": [{
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Status/Main_PositionInFrame",>>
			"name": "circuit_breaker_position",>>
			"id": -1,
			"display_name": "Position of circuit breaker",
			"display_value": "Test position",
			"value": "2",>>
			"unit": "",>>
			"quality": "valid">>
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Status/Main_SwitchStatus",
			"id": -1,
			"display_name": "Switch",
			"display_value": "is switched off",
			"value": "1",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Status/Main_CyclicDataTransfer",
			"id": -1,
			"display_name": "Communication",
			"display_value": "Data exchange active",
			"value": "0",
			"unit": "",
			"quality": "valid"
...
		}]
	}
}
*/

function integrate(spaceConfigure, responseValues){
	let spaceDictionary = new Map()
	for(let i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
		spaceDictionary.set(spaceConfigure.nodeIds[i].address, spaceConfigure.nodeIds[i])
	}
	let responseArray = []
	for(let i = 0; i < responseValues.length; i = i + 1) {
		if(spaceDictionary.get(responseValues[i].address) != null) {
			let resp = spaceDictionary.get(responseValues[i].address)
			let example = {}
			example.value = resp.value
			example.unit = resp.unit
			example.quality = resp.qualityCode
			example.name = resp.name
			example.internal_name = resp.address
			responseArray.push(example)
			/// statistics on identification of each data point
			profilingDictionary.set(resp.address, new Date())
		}
	}
	return responseArray;
}

///mock power center3000 7KN's
function format(dataSourceWrapper, resultObjectArray) {
  let pattern = {}
  if(resultObjectArray !== null && resultObjectArray.length > 0) {
    pattern.item_id = dataSourceWrapper.item_id || 'Node.js softgatewat #001'
    pattern.timestamp = resultObjectArray[0].timestamp ///use machine time
    pattern.count = resultObjectArray.length
    pattern._embedded = {}
    pattern._embedded.item = []
    for(var i = 0; i < resultObjectArray.length; i = i + 1) {
      let obj = resultObjectArray[i]
      pattern._embedded.item.push(
        {
					name: 'shebei bianhao id',
          internal_name: obj.nodeId, 
          value: 'v',
          unit: 'u',
          quality: 'q'
        }
      )
    }
  }
  return pattern 
}

async function begin(dataSourceWrapper, mqttConnectionOptions) {

	acquire(dataSourceWrapper)
	.then((responseValues)=>{
		log.info(responseValues)
		let dataset = format(dataSourceWrapper, responseValues)

		/* MQTTs North-bound*/
		deliver(mqttConnectionOptions, dataset)
		.then((acknowledge)=>{
			log.warn(acknowledge)

			return acknowledge
		})
		.catch((e)=>{
			/* MQTTs North-bound failure*/
			log.error(e)
		})

	})
	.catch((err)=>{
		// South-bound machine hardware failure
		log.fatal(err)
	})
}

module.exports = {
	begin: begin,
  // acquire: acquire,
	// deliver: deliver,
	profilingDictionary: profilingDictionary
}