'use strict'
let express = require('express');
let router = express.Router();
let fs = require('fs')
let path = require('path')

let scan = require('./scan')
let model = require('../model/wrapper')
// let address = require('./address')

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

router.get('/models', function(req, res, next) {
  let obj = model.list('/bootstrap', '.json', '*models*')
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

router.get('/benchmark', async function(req, res, next) {
  let connectivity = require('./connectivity')
  let address = JSON.parse(fs.readFileSync(path.join(__dirname, '/bootstrap/address(Benchmark).json'), 'utf-8'))
  let layout = JSON.parse(fs.readFileSync(path.join(__dirname,'/bootstrap/layout[SENTRON_3WL_ACB].json'), 'utf-8'))
  let model = JSON.parse(fs.readFileSync(path.join(__dirname,'/bootstrap/model[SENTRON_3WL_ACB].json'), 'utf-8'))
  let averageMilleseconds = await connectivity.statistics(address, layout, model)
  res.send(`benchmark result: ${averageMilleseconds}`)
})

/*
  callback from ejs+html webpage 

*/

router.post('/instances', function(req, res) {
  console.log(req.body);
  res.send(200);

  // sending a response does not pause the function
});

router.get('/instances', async function(req, res, next) {
  let samples = require('./instances')

  console.log(req.app.locals, '************************************');
  req.app.locals.foo = function(arg){console.log('+++++++++++===============================', arg)}

  let transient = samples.iterateAddress()
  let obj = []
  for(let k = 0; k < transient.length; k +=1){
    obj.push(JSON.stringify(transient[k]))
  }
  
  res.render('models', {
    title: __filename + new Date().toISOString(),
    items: obj
  })

  // next()
})


module.exports = router;
