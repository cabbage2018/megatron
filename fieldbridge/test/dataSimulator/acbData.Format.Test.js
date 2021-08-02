'use strict'
let expect = require('chai').expect
let log4js = require('log4js')
log4js.configure(require('./log'))
let debug = log4js.getLogger('acbData.Format.Test').debug
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe(__filename, function () {
  describe('7.1.1 Prepare a list of acb equipment data', function () {
    it(`7.7.4 generate static data without format`, function (done) {
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
      sleep(3)
    })
    after(() => {
      debug('pass->' + '7.1.1 Prepare a list of acb equipment data')
    })
  })

  describe('7.1.2 Prepare a list of acb equipment data', function () {
    it(`7.7.4 generate static data with correct name and internal-name`, function (done) {
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
      sleep(3)
    })
    after(() => {
      debug('pass->' + '7.1.1 Prepare a list of acb equipment data')
    })
  })


})
