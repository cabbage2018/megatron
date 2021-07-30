'use strict'
let alert = require('./alert')
let scheduler = require('./scheduler')
let report = require('./report')

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/history', function(req, res, next) {
  console.log(req)
  let list = []
	res.render('list', {
        title: __filename + new Date().toISOString(),
        items: list
    })
});

module.exports = router;
