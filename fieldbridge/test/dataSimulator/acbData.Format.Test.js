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
      filename: './logs/testing.log',
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['stdout', 'request', 'other'], level: 'all' },
    access: { appenders: ['request'], level: 'error'}
  }
})
let debug = log4js.getLogger('acbData.Format.Test').debug
let access = log4js.getLogger('access')
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
describe(__filename, function () {
  describe('7.1.1 Prepare a list of acb equipment data', function () {
    it(`7.7.4 generate static data without format`, function () {
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
      expect(dataset._embedded.item.length >= 773, 'dataset._embedded.item.length >= 773? ').to.be.true
      access.debug(dataset)
      sleep(3)
    })
    after(() => {
      access.debug('pass->' + '7.1.1 Prepare a list of acb equipment data')
    })
  })

  describe('7.1.2 Prepare a list of acb equipment data', function () {
    it(`7.7.4 generate static data with correct name and internal-name`, function () {
      ///have to rad from an existing file for verification
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
      expect(dataset._embedded.item.length >= 773, 'dataset._embedded.item.length >= 773? ').to.be.true
      access.debug(dataset)
      sleep(3)
    })
    after(() => {
      access.debug('pass->' + '7.1.1 Prepare a list of acb equipment data')
    })
  })

})
