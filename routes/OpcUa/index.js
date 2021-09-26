'use strict'
var express = require('express');
var router = express.Router();
let configure = require('./configure')
let models = require('./models')
let address = require('./address')

let log4js = require('log4js')
let log = log4js.getLogger('request')
log.mark(process.env)

/* GET web page. */
router.get('/', function(req, res, next) {
  let availableUrls = ['/logs', '/acq']
  res.contentsList = ''
  for(let item of availableUrls){
    res.contentsList += ` <p>${item}</p>`
  }
  res.send(`available urls: ${res.contentsList}`)
  log.debug(req)
})

router.get('/logs', function(req, res, next) {
  let fs = require('fs')
  let path = require('path')
  let readline = require('readline')

  if(fs.existsSync(path.join(process.cwd(), './logs/errors.log'))) {
    let fRead = fs.createReadStream(path.join(process.cwd(), './logs/errors.log'))
    let objReadline = readline.createInterface({
        input: fRead
    })
    let arr = new Array()    
    objReadline.on('line', line => {
        arr.push(line);
    })
    /// ejs template would display log as a html async
    objReadline.on('close', () => {
      res.render('list', {
        title: __filename + new Date().toISOString(),
        items: arr
      })
      objReadline.close();
    })
  } else {
    res.send('./logs/errors.log' + ' is empty~')
  }
  log.debug(req)
  // next() //if middleware exists
})

router.get('/acq', function(req, res, next) {
  let bridge = require('./bridge')
  let dict = bridge.profilingDictionary
  res.render('dictionary', {
    title: __filename + new Date().toISOString(),
    items: dict
  })

  log.debug(req)
})


router.get('/models', function(req, res, next) {
  let obj = models.list('/bootstrap', '.json', '*models*')
  log.debug(req)

  res.render('list', {
    title: __filename + new Date().toISOString(),
    items: obj
  })
})

router.get('/address', function(req, res, next) {
  let obj = address.list('/bootstrap', '.json', '*address*')
  log.debug(req)
  
  res.render('list', {
    title: __filename + new Date().toISOString(),
    items: obj
  })
})

module.exports = router