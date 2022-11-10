'use strict'
var express = require('express');
var router = express.Router();
let path = require('path');
let fs = require('fs');
let log4js = require('log4js');
let log = log4js.getLogger('routes::daq::opcua');
let {
	acquire,
} = require('../../conn/daq/opcua');

router.get('/', function (req, res, next) {
	res.render('opcua', {
		title: 'Acquire',
		channelType: 'OPC-UA',
	})
});
/*
  OPCUA
*/
// let physicals = JSON.parse(fs.readFileSync(path.join(__dirname, './SIMOCODE(SIRIUS)1.json')));
// console.log(physicals);
// physicals.responses = []
// let epurl = JSON.parse(fs.readFileSync(path.join(__dirname, './SIMOCODE(URL)2.json')))
// console.log(physicals);
router.post("/", async (req, res, next) => {
	res.write('<p>' + req.body.Url + '</p>');
	res.write('<p>' + req.body.Target + '</p>');
	log.debug(req.body);
	let endpointUrl = req.body.Url;
	let addr = [{ "nodeid": "ns=2;i=88" }, { "nodeid": "ns=2;i=102" }];
	// let addr = JSON.parse(req.body.Target);
	log.debug(endpointUrl, addr);
	acquire(endpointUrl, addr)
		.then((response) => {
			log.mark(response);
			res.write('<p>');
			res.write(JSON.stringify(response));
			res.write('</p>');
			res.end();
		})
		.catch((error) => {
			log.error(error);
			res.write('<p>');
			res.write(JSON.stringify(error));
			res.write('</p>');
			res.end();

		})
	res.write('opcua command issued...');
})
module.exports = router