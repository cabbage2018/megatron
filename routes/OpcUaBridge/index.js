'use strict'
var express = require('express');
var router = express.Router();
let configure = require('./configure')

/* GET web page. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource')
})

router.get('/logs', function(req, res, next) {
  let fs = require('fs')
  let path = require('path')
  let readline = require('readline')

  let fRead = fs.createReadStream(path.join(process.cwd(), './logs/livre.log'))
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
  // next() //if middleware exists
})

router.get('/acq', function(req, res, next) {
  let bridge = require('./bridge')
  let dict = bridge.profilingDictionary
  res.render('dictionary', {
    title: __filename + new Date().toISOString(),
    items: dict
  })
})

module.exports = router