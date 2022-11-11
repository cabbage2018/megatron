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
		nodeIds: JSON.stringify(["ns=2;i=102", "ns=2;i=30"])
	})
});
/*
  OPCUA
*/
router.post("/", async (req, res, next) => {
	res.write('<p>' + req.body.Url + '</p>');
	res.write('<p>' + req.body.Target + '</p>');
	log.debug(req.body);
	let endpointUrl = req.body.Url;
	// let addr = [{ "nodeid": "ns=2;i=88" }, { "nodeid": "ns=2;i=102" }];
	let addr = JSON.parse(req.body.Target);
	log.debug(endpointUrl, addr);
	addr.forEach(async (element, index) => {
		await acquire(endpointUrl, [element])
			.then((response) => {
				log.mark(response);
				// let arr = JSON.parse(response);
				for (let i = 0; i < response.length; i = i + 1) {
					res.write('<p>');
					res.write(JSON.stringify(response[i]));
					res.write('</p>');
				}
			})
			.catch((error) => {
				log.error(error);
				res.write('<p>');
				res.write(JSON.stringify(error));
				res.write('</p>');
				// res.end();
			})
		res.write('opcua command issued...');
	});

	setTimeout(() => {
		// res.end();
	}, 60000);

})
module.exports = router