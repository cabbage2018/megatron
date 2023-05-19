'use strict'
let path = require('path')
let fs = require('fs')
//npm install node-snap7
//https://www.npmjs.com/package/node-snap7
let snap7 = require('node-snap7');
let s7client = new snap7.S7Client();
const log4js = require('log4js')
const log = log4js.getLogger('snap7');

class snap7 {
	/**
	 * must have: ip, rack, slot
	 * 
	 * spaces: , 
	 * 
	 * timeout, 
	 * write buffer
	 * ::promisePhysicalLayer
	 * 
	 */
	constructor() {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.protocol = "snap7";
		this.identity = "snap7 plugin";
		this.client = undefined;
	}

	register(callback) {
	}

	heartbeat() {
		console.log(`it is alive @${__filename},`);
	}

	disconnect() {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, 0);
		});
	}

	close() {
		this.disconnect()
		.then()
		.catch();
	}

	test(options){
		let that = this;
		return new Promise(function (resolve, reject) {
		})
	}

	connect(options = null) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that.s7client.ConnectTo(/*'192.168.1.12', 0, 1*/ip, rack, slot, function (err) {
				if (err) {
					reject(err)
				} else {
					resolve(s7client)

				}
			});
		})

	}

	commissioning(spaces){
		let that = this;
		return new Promise(function (resolve, reject) {
			s7client.ConnectTo(/*'192.168.1.12', 0, 1*/ip, rack, slot, function (err) {
				if (err) {
					reject(err)
				} else {
					// Read the first byte from PLC process outputs...
					s7client.ABRead(0, 1, function (fault, res) {
						if (fault) {
							console.log(' >> ABRead failed. Code #' + fault + ' - ' + s7client.ErrorText(fault));
							reject(fault)
						} else {
							console.log(res)
							resolve(res)
						}
					});
				}
			});

		})
	}
}
util.inherits(snap7, events.EventEmitter)
module.exports = snap7