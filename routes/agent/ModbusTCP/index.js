'use strict'
let express = require('express');
let router = express.Router();

let fs = require('fs')
let path = require('path')
let scan = require('./scanner')
// let address = require('./address')
let log4js = require('log4js')
let log = log4js.getLogger('access')
// function sleep(ms) {
//   return new Promise(function (resolve, reject) {
//     setTimeout(resolve, ms);
//   })
// }

router.get('/', function(req, res, next) {
  let configure = require('./configure')
  let list = configure.scan()

  // space; layout; address

  res.render('list', {
    title: __filename + new Date().toISOString(),
    items: list
  })
})

router.get('/layout', async function(req, res, next) {
  res.render('models', {
    title: __filename + new Date().toISOString(),
    items: obj
  })
  // next()
})
// we can display dictionary to an table, for example
//    *--
//    -*-
//    -*-
//    ...
//    *--
//    -*-
module.exports = router;