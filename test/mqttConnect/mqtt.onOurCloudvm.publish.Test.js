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
let log = log4js.getLogger('mqtt.cloudBroker.publish.Test')

describe(__filename, function () {
  const mqtt = require('mqtt')
  describe('7.1.1 Connect to our own mqtt broker', function () {
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
            unit: '%$^&#',
            quality: (Math.random()*max) > (max / 2) ? 'good':'bad'
          }
        )
      }
      let signalArray = dataset
      let client = mqtt.connect( 'mqtt://74.144.136.106:1883',
      {
        username : 'rw',
        password : 'readwrite',
        qos:1
      })
      client.on('error', function (err) {
        done(err)
        log.error('mqtt connect #', err)
        client.end()
      })
    
      client.on('message', function (topic, message) {
        client.unsubscribe('#')
        expect(client !== null, '7.7.4 test.mosquitto.org:1883 server is alive? ').to.be.true
        client.end()

        done()
        log.debug(`MQTTs deliver topic=${topic}, message=${message}`)
      })
    
      client.on('connect', function () {
        //sub
        client.subscribe('powerscada/pm')
        client.subscribe('#')

        //pub
        client.publish('powerscada/pm', JSON.stringify(signalArray), (err)=>{
          done(err)
        })
        log.warn('mqtt connected successfully~')
      })
    })

    after(() => {
    })
  })
})