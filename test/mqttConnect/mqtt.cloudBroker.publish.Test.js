'use strict'
let expect = require('chai').expect
let log4js = require('log4js')
log4js.configure({
  appenders: {
    stdout: {
      type: 'stdout',
    }, 
    request: {
      type: 'dateFile',
      filename: './logs/request',
      pattern: 'yyyy-MM-dd_access.log',
      alwaysIncludePattern: true,
    },
    other: {
      type: 'file',
      maxLogSize: 8388608,
      backups: 3,
      compress : false,
      keepFileExt : true,
      filename: './logs/testing_log.txt',
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['stdout', 'request', 'other'], level: 'all' },
    access: { appenders: ['request'], level: 'info' }
  }
})
let access = log4js.getLogger('request')
let log = log4js.getLogger('mqtt.cloudBroker.publish.Test')
// let mqttOverwsTestFunc = co.wrap(function* () {
//   console.log("Hey!");
// });
describe(__filename, function () {
  
  const mqtt = require('mqtt')
  describe.skip('7.1.1 Connect to a well known mqtt broker', function () {
    it(`7.7.4 test.mosquitto.org:8091`, /*async*/ function (done) {
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
            unit: '$',
            quality: (Math.random()*max) > (max / 2) ? 'good':'bad'
          }
        )
      }
      let signalArray = dataset
      let fs = require('fs')
      fs.writeFileSync('./dist/signalArray.txt', JSON.stringify(signalArray), 'utf-8')

      ///MQTTs pub
      let client = mqtt.connect('ws://test.mosquitto.org:8080',
      {
        username : 'rw',
        password : 'readwrite',
        qos:1
      })

      client.on('error', function (err) {
        log.error('mqtt connect #', err)
        client.end()
        done(err)
      })
    
      client.on('message', function (topic, message) {
        // log.debug(`MQTTs deliver topic=${topic}, message=${message}`)
        expect(client !== null, '7.7.4 test.mosquitto.org:8080? ').to.be.true

        client.unsubscribe('#')
        client.end()
        client = null
        done()
      })
    
      client.on('connect', function () {
        //sub
        client.subscribe('powerscada_testmachine')
        // client.subscribe('#')
        //pub
        client.publish('powerscada_testmachine', JSON.stringify(signalArray), (err)=>{
        })
        log.warn('mqtt connected successfully~')
      })
    })

    after(() => {
    })
  })
})