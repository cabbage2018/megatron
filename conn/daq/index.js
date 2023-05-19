'use strict'
let modbustcp = require('./modbustcp')
let opcua = require('./opcua')
let snap7 = require('./snap7')
let {probe} = require('./restful');
let emulator = require('./emulator')

////must following the backbone 
var express = require('express');
var router = express.Router();

let queue = [modbustcp, opcua, snap7, probe, emulator];
(async ()=>{
	for (var i = 0; i < queue.length; i++) {
		let remote = queue[i];
		const body = await new Promise((resolve, reject) => {
			console.log(`synchronously run: `, remote.des);
			request(`${queryStringSql}&page=${i}`, function(error, response, body) {
				if (error || response.statusCode != 200) {
					reject(error);
				} else {
					resolve(body);
				}
			});
		});
		console.log(body);		
	}	
})

router.get('/', function (req, res, next) {
	const url = req.url
	res.send(`${url} started @${startAt}, until ${new Date().toISOString()}`);
});

// GatewaySerialNumber
module.exports = router;