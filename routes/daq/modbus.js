'use strict'
var express = require('express');
var router = express.Router();
let path = require('path');
let fs = require('fs');
let log4js = require('log4js');
let log = log4js.getLogger('routes::daq::modbus');
let modbus = require('../../conn/daq/modbustcp/modbus');

router.get('/', function (req, res, next) {
	res.render('modbus', {
		title: 'Acquire',
		channelType: 'tcp',
	})
});
/*
  MODBUSTCP TCP
*/
router.post("/tcp", async (req, res, next) => {
	log.debug(req.body);
	log.debug(req.body.Url);
	log.debug(req.body.Target);
	log.debug(req.body.Endian);
	res.write('<p>' + req.body.Url + '</p>');
	res.write('<p>' + req.body.Target + '</p>');
	res.write('<p>' + req.body.Endian + '</p>');
	let urls = req.body.Url.split(':');
	let tars = req.body.Target.split(':');
	log.debug(urls, tars);
	modbus.acquire(urls[0], parseInt(urls[1]), parseInt(urls[2]),
		parseInt(tars[0]), parseInt(tars[1]), parseInt(tars[2]), 3000, [31, 255])
		.then((response) => {
			log.mark(response);
			res.write('<p>' + response + '</p>');
			res.end();
		})
		.catch((error) => {
			log.error(error);
			res.write('<p>' + JSON.stringify(error) + '</p>');
			res.end();
		})
	log.debug('modbus command issued...');
})
module.exports = router;