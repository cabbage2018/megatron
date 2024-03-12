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

router.get('/ts', function (req, res, next) {
    res.render('timeseries', {
        title: 'Presentation',
    })
    // log.debug(req, res, next);
})

router.get('/updates', function (req, res, next) {
    let arr = [95.6, 54.4, 29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 33.2];
    let str = JSON.stringify(arr);
    res.write(' ' + str + ' ');
    res.end();
})

router.get('/diagram', function (req, res, next) {
    res.render('diagram', {
        title: 'Data is alive.',
    })
})

module.exports = router;