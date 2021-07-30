'use strict'

let profilingDictionary = new Map()
const mqtt = require('mqtt')


function deliver(MqttsOptions, signalArray) {

  let deliverPromise = new Promise(async function (resolve, reject) {
    let client = mqtt.connect(MqttsOptions.url, MqttsOptions.options)

    client.on('report', function () {
      tracer.debug('report: ', report)
    })

    client.on('error', function (err) {
      tracer.error('mqtt connect #', err)
      client.end()
    })

    client.on('message', function (topic, message) {
      console.log(`MQTTs deliver topic=${topic}, message=${message}`)
    })

    client.on('connect', function () {
      client.subscribe("/gw")
    })

    client.subscribe(MqttsOptions.subscribeTopic)
    client.publish(MqttsOptions.publishTopic, JSON.stringify(signalArray))
  })
  return deliverPromise

}

function format() { }

function acquire() { }

function query(spaceConfigure) {

  let acquisitionPromise = new Promise(async function (resolve, reject) {    
    
    let client = OPCUAClient.create({
      endpoint_must_exist: false
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

    try {
      console.log(`${session} @ [${new Date().toISOString()}] "session created"`)
      let responseValues = await session.readVariableValue(spaceConfigure.nodeIdsArray)
      resolve(responseValues)
    }
    catch (err) {
      reject(err)

      let r = err
      r.timestamp = new Date()
      profilingDictionary.set('session.error', r)

      await session.close()
      await client.disconnect()
    }

    await session.close()
    await client.disconnect()

  })

  return acquisitionPromise
}

async function scan(dataSourceWrapper) {

}


module.exports = {
  scan: scan,
  acquire: acquire,
}