'use strict'
let expect = require('chai').expect
let log4js = require('log4js')
log4js.configure(require('./log'))
let debug = log4js.getLogger('mqtt.cloudBroker.publish.Test').debug
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

describe(__filename, function () {
  const mqtt = require('mqtt')

  describe('7.1.1 Connect to a well known mqtt broker', function () {
    it(`7.7.4 test.mosquitto.org:8091`, function (done) {
      let dataset = {}
      dataset.timestamp = new Date()
      dataset._embedded = {}
      dataset._embedded.item = []
      let max = 65535
      for(var i = 0; i < 774; i = i + 1) {
        dataset._embedded.item.push(
          {
            name: 'DEVICE_ID' + Math.ceil(Math.random()*max),
            internal_name: 'obj.nodeId' + Math.round(Math.random()*max), 
            value: Math.floor(Math.random()*max),
            unit: '%$^&#',
            quality: 'good'
          }
        )
      }
      let signalArray = dataset
      ///MQTTs pub
      let client = mqtt.connect({
        host: 'test.mosquitto.org',
        port: 8091 ,//
        user     : 'rw',
        password : 'readwrite',
      }, {
        qos:1
      })
      client.on('error', function (err) {
        reject(err)
        tracer.error('mqtt connect #', err)
        client.end()
      })
      client.on('message', function (topic, message) {
        console.log(`MQTTs deliver topic=${topic}, message=${message}`)

        done()
        sleep(1000)
        client.end()
      })
      client.on('connect', function () {
        //sub
        client.subscribe('powerscada_testmachine')

        //pub
        client.publish('powerscada_testmachine', JSON.stringify(signalArray), (err)=>{
          done(err)
        })
      })
      expect(client !== null, '7.7.4 test.mosquitto.org:8091? ').to.be.true
    })

    after(() => {
      debug('pass->' + '7.1.1 Prepare a list of acb equipment data')
    })
  })
})