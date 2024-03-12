'use strict'
let path = require('path')
let fs = require('fs')
let snap7 = require('node-snap7');
let s7client = new snap7.S7Client();s
const log4js = require('log4js')
const log = log4js.getLogger('snap7');
const util = require('util');
const events = require('events');

class snap7 {
	constructor() {
		this.client = new snap7.S7Client();
		this.ip = ip;
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

	connect(options = null) {
		let that = this;
		return new Promise(function (resolve, reject) {

			that.s7client.ConnectTo(this.ip, this.rack, this.slot, function (err) {
				if (err) {
					reject(err);
				} else {
					resolve(this.client);
				}
			});
		})

	}

	read(spaces) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that.ConnectTo(this.ip, rack, slot, function (err) {
				if (err) {
					reject(err);
				} else {
					// Read the first byte from PLC process outputs...
					that.client.ABRead(0, 1, function (fault, res) {
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