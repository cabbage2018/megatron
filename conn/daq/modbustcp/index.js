'use strict'
const log4js = require('log4js')
const log = log4js.getLogger('conn::daq::modbustcp:index')
let inventory = require('./modbus')
let {
	// array,
	measure,
	tariff,
	schedule,
} = require('./commissioning')
let {
	acquire,
	access
} = require('./modbus')

module.exports = {
	acquire: acquire,
	access: access,
	measure: measure,
	tariff: tariff,
	schedule: schedule,
	commission: async function (req, res, next) {
		if (res.physicals && res.physicals.length > 0) {
		}
		return
	},
	instantiate: function (req, res, next) {
		if (req.candidates) {
			for (let i = 0; i < req.candidates.length; i = i + 1) {
				let addr = req.candidates[i]
				req.serviceProvider = search(addr.model)
				if (req.serviceProvider.space && req.serviceProvider.layout) {
					for (let j = 0; j < req.serviceProvider.space.length; j = j + 1) {
						let sample = req.serviceProvider.space[j]
						let scramble = {
							ip: addr.ip,
							port: addr.port,
							subordinatorNumber: addr.subordinatorNumber,
							model: addr.model,

							// protocol: req.physical.protocol,
							timeoutMillisecond: addr.timeoutMillisecond ? addr.timeoutMillisecond : 1000,

							register: sample.register,
							quantity: sample.quantity,
							category: sample.category,
							functioncode: sample.functioncode,


							flash: sample.flash ? sample.flash : [0xef],
						}
						res.physicals.push(scramble)
					}
				}
			}
		}
		console.log(res.physicals)
		return
	},

	orchestrate: /**/async function (req, res, next) {
		let datasourceUnreachable = new Map()
		let datasourceOnline = new Map()

		let array = bootstrap()
		if (req) {
			// let's assume req is array~
			log.trace(req)
			let temp = req.concat(array)
			array = temp
		}
		// 
		console.log(`${array.length} physical spaces loaded`)

		// query
		for (var i = 0; i < array.length; i++) {
			let e = array[i]
			if (e.ip && e.port && e.subordinatorNumber && e.functioncode && e.register && e.quantity && e.timeoutMillisecond) {
				await inventory.acquire(
					e.ip,
					e.port,
					e.subordinatorNumber,
					e.functioncode,
					e.register,
					e.quantity,
					e.timeoutMillisecond,
					e.flash)
					.then((responses) => {
						// raw data claim
						log.debug(responses)

						let buffer = responses.response._body._valuesAsBuffer
						let hexstr = buffer.toString('hex')
						hexstr['updatedAt'] = new Date(responses.metrics.receivedAt)
						log.debug(hexstr)

						let list = []
						for (let i = 0; i < responses.response._body._valuesAsBuffer.length / 2; i += 2) {
							let focused = responses.response._body._valuesAsBuffer.slice(i * 2, i * 2 + 2)
							let win = Buffer.from(focused)
							list.push((responses.request._body._start + i) + ':' + win.readInt16BE(0) + '(Int16),' + win.toString('hex') + '(HEX);')
						}
						res.write(`<p> ${list.length} :: ${e}</p>`)
						// datasourceOnline.set(e , responses)
						res.push(hexstr)
						next(responses)
					})
					.catch((error) => {
						// datasourceUnreachable.set(e, error)
						log.error(error)
					})
			} else {
				throw new Error(`missing parameters: ${__filename}`)
			}
		}
		return
	},

}