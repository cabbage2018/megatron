'use strict'
var express = require('express');
var router = express.Router();
let path = require('path')
let fs = require('fs')
let log4js = require('log4js')
let log = log4js.getLogger('routes::model::simocode')
let {
	acquire,
} = require('../../../conn/daq/opcua');

router.get('/', function (req, res, next) {
	let dir = path.join(process.cwd(), './public/images/model/simocode');
	log.debug(dir);
	let addrbook = fs.readdirSync(dir).filter(file => file.endsWith('.json'));
	let addrs = []
	if (addrbook.length > 0) {
		let arr = JSON.parse(fs.readFileSync(path.join(process.cwd(), './public/images/model/simocode/' + addrbook[0])));
		arr.forEach((item, index) => {
			log.debug(item, index);
			addrs.push(item.nodeId);
		})
	}
	res.render('simocode', {
		title: 'Acquire SIMOCODE',
		channelType: 'OPC-UA',
		nodeIds: JSON.stringify(addrs)
	})
	log.debug('read command issued...');
});

router.post("/", (req, res, next) => {
	res.write('<p>' + req.body.Url + '</p>');
	res.write('<p>' + req.body.Target + '</p>');
	log.debug(req.body);
	let endpointUrl = req.body.Url;
	// let addr = [{ "nodeid": "ns=2;i=88" }, { "nodeid": "ns=2;i=102" }];
	let addr = JSON.parse(req.body.Target);
	log.debug(endpointUrl, addr);

	let segmentedArr = []
	for (let i = 0; i < addr.length; i = i + 1) {
		segmentedArr.push(addr[i]);

		// make segments to array
		if ((i + 1) % 100 === 0) {
			acquire(endpointUrl, segmentedArr)
				.then((response) => {
					log.mark(response);
					// let arr = JSON.parse(response);
					res.write('<p>' + '...' + JSON.stringify(response) + '</p>');
					// for (let i = 0; i < arr.length; i = i + 1) {
					// 	res.write('<p>');
					// 	res.write(JSON.stringify(arr[i]));
					// 	res.write('</p>');
					// }
				})
				.catch((error) => {
					log.error(error);
					res.write('<p>');
					res.write(JSON.stringify(error));
					res.write('</p>');
					// res.end();
				})
			res.write('<p>' + '...' + JSON.stringify(segmentedArr) + '</p>');
			segmentedArr = [];
			// continue;
		}
	}
	// left remaining
	if (segmentedArr.length > 0) {
		acquire(endpointUrl, segmentedArr)
			.then((response) => {
				log.mark(response);
				// let arr = JSON.parse(response);
				res.write('<p>' + '...' + JSON.stringify(response) + '</p>');
				// for (let i = 0; i < response.length; i = i + 1) {
				// 	res.write('<p>');
				// 	res.write(JSON.stringify(response[i]));
				// 	res.write('</p>');
				// }
			})
			.catch((error) => {
				log.error(error);
				res.write('<p>');
				res.write(JSON.stringify(error));
				res.write('</p>');
			})
		res.write('<p>' + '...' + JSON.stringify(segmentedArr) + '</p>');
		segmentedArr = [];
	}
	setTimeout(() => {
		// res.end();
	}, 30000);
})
module.exports = router;