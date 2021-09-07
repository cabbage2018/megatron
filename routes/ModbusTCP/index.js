'use strict'
let express = require('express');
let router = express.Router();
let scan = require('./scan')
let address = require('./address')

let log4js = require('log4js')
let log = log4js.getLogger('request')

router.get('/', function(req, res, next) {
  let obj = scan.profilingDictionary
  res.contentsList = ''
  for(let item of obj){
    res.contentsList += ` <p><li>${item}</li></p>`
  }

  log.debug(req)
  res.render('projector', {
    title: __filename + new Date().toISOString(),
    items: obj
  })
})

router.get('/start', function(req, res, next) {
  let result = scan.startAcquireTask()
  log.debug(req)
  res.send(`start result: ${result}`)
})

router.get('/stop', function(req, res, next) {
  let result = scan.stopAcquireTask()
  log.debug(req)
  res.send(`stop result: ${result}`)
})

module.exports = router;
