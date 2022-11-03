'use strict'
let path = require('path')
let fs = require('fs')
//npm install node-snap7
//https://www.npmjs.com/package/node-snap7
let snap7 = require('node-snap7');
let s7client = new snap7.S7Client();
module.exports = {
	/*SOME DEVICE LIKE SIMOCODE PROV PN HAS VERY SMALL LIMIT; but SCADA has bigger*/
	acquire: async function (ip, rack, slot) {
		let promisePhysicalLayer = new Promise(function (resolve, reject) {
			s7client.ConnectTo(/*'192.168.1.12', 0, 1*/ip, rack, slot, function (err) {
				if (err) {
					reject(err)
				} else {
					// Read the first byte from PLC process outputs...
					s7client.ABRead(0, 1, function (err2, res) {
						if (err2) {
							console.log(' >> ABRead failed. Code #' + err2 + ' - ' + s7client.ErrorText(err2));
							reject(err2)
						} else {
							// ... and write it to stdout
							console.log(res)
							resolve(res)
						}
					});
				}
			});
		})
		return promisePhysicalLayer;
	}
}
