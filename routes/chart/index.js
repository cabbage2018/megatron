'use strict'
var express = require('express');
var router = express.Router();
let log4js = require('log4js');
let log = log4js.getLogger('routes::chart::');

router.get('/', function (req, res, next) {
    res.render('chart', {
        title: 'Presentation',
    })
    // log.debug(req, res, next);
})

module.exports = router;