'use strict'
var express = require('express');
var router = express.Router();
let configure = require('./configure')

/* GET web page. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource')
})

router.get('/history', function(req, res, next) {
  console.log(req)
  let list = []
	res.render('list', {
    title: __filename + new Date().toISOString(),
    items: list
  })
})

router.get('/logs', function(req, res, next) {
  const fs = require('fs')
  const readline = require('readline')

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

module.exports = router