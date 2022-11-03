'use strict'
let fs = require('fs')
let path = require('path')
var crypto = require('crypto');

var chai = require('chai');
let log4js = require('log4js')
log4js.configure({
  appenders: {
    stdout: {
      type: 'stdout',
    },
    access: {
      type: 'dateFile',
      filename: path.join(process.cwd(), '/logs/test.log'),
      pattern: 'yyyy-MM-dd',
      alwaysIncludePattern: true,
      "keepFileExt": true

    }
  },
  categories: {
    default: { appenders: ['stdout', 'access'], level: 'all' },
  }
})
let log = log4js.getLogger('unitTest.crypto.toString')
let expect = require('chai').expect
describe(__filename, function () {
  describe('crypto', function () {    
    before(() => {
      log.debug('before...')
    })

    log.debug(__dirname)

    it(`randomBytes(`, function () {
      let numStr = crypto.randomBytes(3).toString('hex')//parseInt(x.toString('hex'), 16)
      log.info(numStr)
      expect(numStr !== undefined, `${numStr} = crypto.randomBytes(6).toString('dec')`).to.be.true
    })

    after(() => {    
      log.debug('after.')  
    })
  })
})