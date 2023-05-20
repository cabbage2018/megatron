'use strict'
var express = require('express');
var router = express.Router();
let path = require('path');
let fs = require('fs');
let log4js = require('log4js');
let log = log4js.getLogger(':modbustcp');
let modbustcp = require('../../conn/daq/modbustcp');

router.get('/tcp', function (req, res, next) {
	res.render('modbustcp', {
		title: 'Append',
		channelType: 'tcp',
	})
});
/*
  MODBUSTCP
*/
router.post("/tcp", async (req, res, next) => {
	log.debug(req.body);
	log.debug(req.body.Ip);
	log.debug(req.body.Port);
	log.debug(req.body.Slave);
	let ip = req.body.Ip;
	let port = req.body.Port;
	let slave = req.body.Slave;

	res.write('<p>' + req.body.Ip + '</p>');
	res.write('<p>' + req.body.Port + '</p>');
	res.write('<p>' + req.body.Slave + '</p>');
	// let urls = req.body.Url.split(':');
	// let tars = req.body.Target.split(':');
	// log.debug(urls, tars);

	let remote = new modbustcp();
	remote.connect({ip: ip, port: port, slave: slave})
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
	log.debug('modbus-tcp command');
})
module.exports = router;