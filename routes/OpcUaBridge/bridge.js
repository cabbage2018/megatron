'use strict'

let profilingDictionary = new Map()
let mqtt = require('mqtt')
let {
  AttributeIds,
  OPCUAClient,
  TimestampsToReturn,
} = require('node-opcua')

let log4js = require('log4js')
let alert = log4js.getLogger('error')
let log = log4js.getLogger('routes::bridge')

function deliver(MqttsOptions, signalArray) {

  let deliverPromise = new Promise(async function (resolve, reject) {

		let client = mqtt.connect(MqttsOptions.endpointUrl, MqttsOptions.options)	

		client.on('error', function (err) {
			alert.error('mqtt connect #', err)
			client.end()
			reject(err)
		})	

		client.on('message', function (topic, message) {
			log.info(`MQTTs deliver topic=${topic}, message=${message}`)

			setTimeout(async function () {
				resolve(`task due to timer time out/MQTTs deliver topic=${topic}, message=${message}`)

			client.unsubscribe(topic, (err, packet)=>{
				client.end(true, (err)=>{
					alert.error('mqtt close #', err)
				})
				log.info(`unsubscribe.`)

				// client = null
			})

			}, 3000);
		})

		client.on('connect', function () {
			client.subscribe(MqttsOptions.subscribeTopic)
			client.publish(MqttsOptions.publishTopic, JSON.stringify(signalArray), (err, packet)=>{
				if(err){
					log.error(err)
					reject(err)
				}

				if(packet){
					log.mark(packet)
				}				
			})	
			// resolve('Connected mqtt successfully!')
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
      reject(e)
    })
    await client.connect(spaceConfigure.endpointUrl)
    let session = await client.createSession()
    log.info(`${session} @ [${new Date().toISOString()}] "session created"`)
	
		try {
			let responseArray = [];
      if(bulkMode) {
        /*
          BE VERT CAREFUL ABOUT THE BULK SIZE
          EACH OPC UA SERVER HAS ITS OWN MAXIMUM DATA POINTS LIMIT
          FOR EXAMPLE BULK OF SIMOCODE = 130
        */
        let BULKSIZE = 1000;
				var segmentValues = [];
				let nodeIds = []
				for(let i = 0; i < spaceConfigure.nodeIds.length; i = i+ 1) {
					nodeIds.push(spaceConfigure.nodeIds[i].address)
				}

        for(var i = 0; i < nodeIds.length / BULKSIZE; i += 1) {
          let start = i * BULKSIZE;
          let stop = (i === nodeIds.length / BULKSIZE) ? nodeIds.length : (i + 1) * BULKSIZE;
					var values = await session.readVariableValue(nodeids.slice(start, stop));
					
					for(let j = 0; j < values.length; j = j + 1){
						segmentValues.push(values[j]);
					}
				}
				responseArray = segmentValues
				
      } else {
        ///discrete
        for(var i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
					let resp = await session.readVariableValue(spaceConfigure.nodeIds[i].address)
					responseArray.push(resp)
					// log.mark(resp)
        }
			}

      log.debug(`updated ${responseArray.length} data points`)
      resolve(responseArray)
    }
    catch (err) {
      if(session) {
        await session.close()
        session = null  
      }
      if(client) {
        await client.disconnect()
        client = null  
      }
      
			reject(err)
		}
		
		if(session) {
			await session.close()
			session = null  
		}
		if(client) {
			await client.disconnect()
			client = null  
		}		
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

	if(	spaceConfigure.nodeIds.length !== responseValues.length	){
		log.warn('space length <> response values length')
		return []
	}

	let comboArray = []
	for(let i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
		if(spaceDictionary.get(spaceConfigure.nodeIds[i].address) != null) {
			let addr = spaceConfigure.nodeIds[i]	///spaceDictionary.get(responseValues[i].address)
			let dataset = {}
			dataset.value = responseValues[i].value.value
			dataset.quality = responseValues[i].statusCode._name
			dataset.name = addr.name
			dataset.internal_name = addr.address
			comboArray.push(dataset)

			/// statistics on last acquisition for identification of presence for each data point
			profilingDictionary.set(spaceConfigure.nodeIds[i].address, responseValues[i].value.value + ', @ ' + new Date().toISOString())
		}
	}
	return comboArray;
}

///mock power center3000 7KN's
function format(dataSourceWrapper, resultObjectArray) {
  let pattern = {}
	if(resultObjectArray !== null && resultObjectArray.length > 0
		&& dataSourceWrapper !== null && dataSourceWrapper.nodeIds.length === resultObjectArray.length) {
    pattern.item_id = dataSourceWrapper.item_id || 'Node.js softgatewat #001'
    pattern.timestamp = new Date()///resultObjectArray[0].timestamp ///use machine time
    pattern.count = resultObjectArray.length
		pattern._embedded = {}
		
    pattern._embedded.item = []
    for(var i = 0; i < resultObjectArray.length; i = i + 1) {
			let resp = resultObjectArray[i]
      pattern._embedded.item.push({
					name: dataSourceWrapper.nodeIds[i].name,
          internal_name: dataSourceWrapper.nodeIds[i].address, 
          value: resp.value.value,
          quality: resp.statusCode._name
			})
			
			/// statistics on last acquisition for identification of presence for each data point
			profilingDictionary.set(dataSourceWrapper.nodeIds[i].address, resp.value.value + ', @ ' + new Date().toISOString())
    }
  }
  return pattern 
}

/// final version, @Aug 10th,
function aggregate(dataSourceWrapper, resultObjectArray) {
	let devices = new Map()

	if(resultObjectArray !== null && resultObjectArray.length > 0
		&& dataSourceWrapper !== null && dataSourceWrapper.nodeIds.length === resultObjectArray.length) {
		
    for(var i = 0; i < resultObjectArray.length; i = i + 1) {
			let resp = resultObjectArray[i]			
			if(devices.get(dataSourceWrapper.nodeIds[i].name)){
				let queue = devices.get(dataSourceWrapper.nodeIds[i].name)
				queue.push({
          internal_name: dataSourceWrapper.nodeIds[i].address, 
          value: resp.value.value,
          quality: resp.statusCode._name
				})
			} else {
				let queue = []
				queue.push({
          internal_name: dataSourceWrapper.nodeIds[i].address, 
          value: resp.value.value,
          quality: resp.statusCode._name
				})
				devices.set(dataSourceWrapper.nodeIds[i].name, queue)
			}

			/// don't log big volume data but profile to a single map to save space
			profilingDictionary.set(dataSourceWrapper.nodeIds[i].address, resp.value.value + ', @ ' + new Date().toISOString())
    }
  }
  return devices
}

async function runOnce(dataSourceWrapper, mqttConnectionOptionArray) {

	acquire(dataSourceWrapper, 125, false)
	
	.then(async (responseValues)=>{

		log.debug(responseValues)
		// let myPattern = integrate(spaceConfigure, responseValues)
		let dataset = aggregate(dataSourceWrapper, responseValues)
		for (var x of dataset) {
			log.debug(x[0] + '=' + JSON.stringify(x[1]));

			let dev = {}
			dev.item_id = x[0]
			dev.timestamp = new Date()
			dev.count = x[1].length
			dev._embedded = {}
			dev._embedded.item = x[1]

			for(let j = 0; j < mqttConnectionOptionArray.length; j = j + 1){				
				let mqttConnectionOptions = mqttConnectionOptionArray[j]
				await deliver(mqttConnectionOptions, dev)
				.then((acknowledge)=>{
					log.mark(acknowledge)
				})
				.catch((e)=>{
					log.error(e)
				})
	
			}

		}
	})
	.catch((err)=>{
		// South-bound machine hardware failure
		log.fatal(err)
	})
}

/* check MQTTs Connectivity */
async function quickCheck(dataSourceWrapper, mqttConnectionOptionArray) {
  let periodicJob4Reading = setTimeout(async function () {
		let dataset = new Map()
		for(let i = 0; i < 3; i += 1){
			let responseValues = []
			for(let j = 0; j < 1; j = j + 1){
				responseValues.push({
					internal_name: 'internal_name' + j,
					value: Math.random()*65535,
					quality: 'Unkonwn Questionmark'
				})
			}
			dataset.set('device-ID-' + i, responseValues)
		}
		// let dataset = aggregate(dataSourceWrapper, responseValues)
		for (var x of dataset) {
			log.debug(x[0] + '=' + JSON.stringify(x[1]));
			let dev = {}
			dev.item_id = x[0]
			dev.timestamp = new Date()
			dev.count = x[1].length
			dev._embedded = {}
			dev._embedded.item = x[1]

			for(let j = 0; j < mqttConnectionOptionArray.length; j = j + 1){				
				let mqttConnectionOptions = mqttConnectionOptionArray[j]
				await deliver(mqttConnectionOptions, dev)
				.then((acknowledge)=>{
					log.mark(acknowledge)
				})
				.catch((e)=>{
					log.error(e)
				})
			}
		}
	}, 3000);	
}


module.exports = {
	runOnce: runOnce,
	profilingDictionary: profilingDictionary,
	quickCheck: quickCheck,
}