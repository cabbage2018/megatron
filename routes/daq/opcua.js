'use strict'
var express = require('express');
var router = express.Router();
let path = require('path');
let fs = require('fs');

/*
  OPCUA
*/
let {
	acquire,
	access,
} = require('../../conn/daq/opcua');

let physicals = JSON.parse(fs.readFileSync(path.join(__dirname, './SIMOCODE(SIRIUS)1.json')));
console.log(physicals);
physicals.responses = []
let epurl = JSON.parse(fs.readFileSync(path.join(__dirname, './SIMOCODE(URL)2.json')))
console.log(physicals);
router.get("/opcua", async (req, res, next) => {
	let addr = []
	physicals.forEach(remote => {
		addr.push(remote.addr);
	})
	console.log(addr, addr.length);

	await access(epurl, addr)
		.then((response) => {
			log.mark(response);
			physicals['responses'].push(response);
			res.write('<p>')
			res.write(JSON.stringify(item))
			res.write('</p>')

		})
		.catch((error) => {
			log.error(error)

			res.write('<p>')
			res.write(JSON.stringify(item))
			res.write('</p>')
		})
})
module.exports = router