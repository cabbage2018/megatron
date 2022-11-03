'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')
const log4js = require('log4js')
const { acquire } = require('./modbus')
const log = log4js.getLogger('conn::daq::modbustcp:configure')
let measureDic = new Map();
let tariffDic = new Map();
let intervalTask = null;
let quarterlyReport = null;
const measureInterval = 120 * 1000;
module.exports = {
	measure: function (ip, port, subnum, fc, start, quantity, ms) {
		let entry = ip + ':' + port + ':' + subnum;
		let phy = {
			fc: fc,
			register: start,
			quantity: quantity,
			timeout: ms
		}
		if (measureDic.get(entry)) {
			let arr = measureDic.get(entry);
			arr.push(phy);
			measureDic.set(entry, arr);
		} else {
			measureDic.set(entry, [phy]);
		}
	},
	tariff: function (ip, port, subnum, fc, start, quantity, ms) {
		let entry = ip + ':' + port + ':' + subnum;
		let phy = {
			fc: fc,
			register: start,
			quantity: quantity,
			timeout: ms
		}
		if (tariffDic.get(entry)) {
			let arr = tariffDic.get(entry);
			arr.push(phy);
			tariffDic.set(entry, arr);
		} else {
			tariffDic.set(entry, [phy]);
		}
	},
	schedule: function () {
		// Cyclic
		intervalTask = setInterval(async function () {
			try {
				for (let i of measureDic) {
					let entry = i[0];
					let arr = i[1];
					let split = entry.split(':');
					let host = split[0];
					let port = parseInt(split[1]);
					let subnum = parseInt(split[2]);
					for (let j = 0; j < arr.length; j++) {
						let phys = arr[j];
						let fc = phys.fc
						let register = phys.register
						let quantity = phys.quantity
						let timeout = phys.timeout
						await acquire(host, port, subnum, fc, register, quantity, timeout)
							.then((resp) => {
								log.mark(resp);
							})
							.catch((err) => {
								log.error(err);
							});
					}
				}
			} catch (error) {
				logger.debug('on publish error:', error)
			}
		}, measureInterval);
		// Callendar task
		quarterlyReport = cron.schedule('0 */15 * * * *', async () => {
			try {
				for (let i of tariffDic) {
					let entry = i[0];
					let arr = i[1];
					let split = entry.split(':');
					let host = split[0];
					let port = parseInt(split[1]);
					let subnum = parseInt(split[2]);
					for (let j = 0; j < arr.length; j++) {
						let phys = arr[j];
						let fc = phys.fc
						let register = phys.register
						let quantity = phys.quantity
						let timeout = phys.timeout
						await acquire(host, port, subnum, fc, register, quantity, timeout)
							.then((resp) => {
								log.mark(resp);
							})
							.catch((err) => {
								log.error(err);
							});
					}
				}
			} catch (error) {
				logger.debug('-->', error)
			}
			console.log('::-', new Date())
		})
		quarterlyReport.start();
	},
}
