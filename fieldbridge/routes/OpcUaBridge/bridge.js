'use strict'

let profilingDictionary = new Map()
const mqtt = require('mqtt')
const {
  AttributeIds,
  OPCUAClient,
  TimestampsToReturn,
} = require('node-opcua');
let log4js = require('log4js')
let email = log4js.getLogger('email')
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


/** 
{
	"item_id": "20f82405-dceb-46ba-969c-d501ce86d683",
	"timestamp": "2021-03-19T04:21:35+01",
	"count": 69,
	"total": 69,
	"_embedded": {
		"item": [{
			"internal_name": "StatusValues/SystemTime",
			"id": 90,
			"display_name": "System time",
			"display_value": "5/9/2000 6:45:44 PM +02:00",
			"value": "2000-05-09T16:45:44Z",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Status/Main_PositionInFrame",
			"name": "circuit_breaker_position",
			"id": -1,
			"display_name": "Position of circuit breaker",
			"display_value": "Test position",
			"value": "2",
			"unit": "",
			"quality": "valid"
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
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Status/ControlEnableDPWrite",
			"id": -1,
			"display_name": "Communication write protection",
			"display_value": "Write protection inactive",
			"value": "1",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Status/Diag_SpringCharged",
			"id": -1,
			"display_name": "Spring energy store",
			"display_value": "Spring energy store is compressed",
			"value": "1",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Trips/Diag_TripsETU/Diag_TripTrip_Overload",
			"id": -1,
			"display_name": "Overload (L)",
			"display_value": "Inactive",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Trips/Diag_TripsETU/Diag_TripTrip_InstShortCircuit",
			"id": -1,
			"display_name": "Instantaneous short circuit (I)",
			"display_value": "Inactive",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Trips/Diag_TripsETU/Diag_TripTrip_ShortTimeDelay",
			"id": -1,
			"display_name": "Short-time delayed short circuit (S)",
			"display_value": "Inactive",
			"value": "0",
			"unit": "",
			"quality": "valid"
...
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Warnings/Diag_Warn_LoadPickup",
			"id": -1,
			"display_name": "Load pickup",
			"display_value": "Inactive",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Warnings/Diag_Warn_OverloadN",
			"id": -1,
			"display_name": "Overload N-conductor",
			"display_value": "Inactive",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Warnings/Diag_Warn_LoadShed",
			"id": -1,
			"display_name": "Load shedding",
			"display_value": "Inactive",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/Diagnositic/Diag_CB/Diag_Warnings/Diag_Warn_GF",
			"id": -1,
			"display_name": "Ground fault",
			"display_value": "Inactive",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/MaintenanceAndStatistic/Diag_CountGearLoad",
			"id": 80,
			"display_name": "Number of switching operations under load",
			"display_value": "0",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/MaintenanceAndStatistic/Diag_CountGearTrip",
			"id": 81,
			"display_name": "Number of switching operations caused by trips",
			"display_value": "2",
			"value": "2",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/MaintenanceAndStatistic/Diag_CountGearControl",
			"id": 82,
			"display_name": "Switching cycle counter (for switching cycle on/off)",
			"display_value": "5",
			"value": "5",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/MaintenanceAndStatistic/Diag_CounterShortCircuit",
			"name": "s_trip_counter",
			"id": 104,
			"display_name": "Number of S trips",
			"display_value": "0",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "StatusValues/MaintenanceAndStatistic/Diag_ContactWearSum/Diag_WearN",
			"id": 107,
			"display_name": "Phase N",
			"display_value": "0",
			"value": "0",
			"unit": "",
			"quality": "valid"
		}, {
			"internal_name": "Energy/Wh/Normal/MWh",
			"id": 238,
			"display_name": "Active energy in normal direction",
			"display_value": "0.000 Wh",
			"value": "0",
			"unit": "Wh",
			"quality": "valid"
		}, {
			"internal_name": "Energy/Wh/Reverse/kWh",
			"id": 434,
			"display_name": "Active energy in reverse direction",
			"display_value": "0.00 kWh",
			"value": "0",
			"unit": "Wh",
			"quality": "valid"
		}, {
			"internal_name": "ThreePhaseSystem/Inst/V_Bal#",
			"id": 173,
			"display_name": "Unbalance Voltage",
			"display_value": "invalid",
			"value": "0",
			"unit": "%",
			"quality": "invalid"
		}]
	}
}
*/
function format(resultObjectArray) {
  let pattern = {}
  if(resultObjectArray !== null && resultObjectArray.length > 0) {
    // pattern.item_id = uuid()
    pattern.timestamp = resultObjectArray[0].timestamp///use machine time
    // pattern.count = resultObjectArray.length
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
  ///mock power center3000 7KN's
  return pattern 
}

function acquire() { }

function query(spaceConfigure, bulksize = 1500, bulkMode = false) {
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
      var responseValues = [];
      if(bulkMode) {
        /*
          BE VERT CAREFUL ABOUT THE BULK SIZE
          EACH OPC UA SERVER HAS ITS OWN MAXIMUM DATA POINTS LIMIT
          FOR EXAMPLE BULK OF SIMOCODE = 130
        */
        const BULKSIZE = 1000;
        for(var i = 0; i < nodeIds.length / BULKSIZE; i += 1) {
          const start = i * BULKSIZE;
          const stop = (i === nodeIds.length / BULKSIZE) ? nodeIds.length : (i + 1) * BULKSIZE;
          var values = await session.readVariableValue(nodeids.slice(start, stop));
          responseValues.push(values);
        }
      } else {
        ///discrete reading
        for(var i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
					let example = {}
					example.response = await session.readVariableValue(spaceConfigure.nodeIds[i].address)
					example.name = spaceConfigure.nodeIds[i].deviceId
          responseValues.push(example)
        }
      }
      log.debug(`updated ${responseValues.length} data points`)
      resolve(responseValues)
    }
    catch (err) {
      await session.close()
      await client.disconnect()
      let r = err
      r.timestamp = new Date()
			reject(err)
    }
    await session.close()
    await client.disconnect()
  })
  return acquisitionPromise
}

async function scan() {
	let dataSourceWrapper = require('../../config/spaces.json')
	query(dataSourceWrapper)
	.then((responseValues)=>{
		log.debug(responseValues)

		let dataset = format(responseValues)

		deliver(mqttOptions, dataset)
		.then((acknowledge)=>{
			log.info(acknowledge)
		})
		.catch((e)=>{
			log.error(e)// need email to notify project management if necessary
		})
	})
	.catch((err)=>{log.error(err)})	
}
scan()

module.exports = {
  scan: scan,
  acquire: acquire,
  query: query,
}