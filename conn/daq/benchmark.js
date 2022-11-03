'use strict'
let modbustcp = require('modbustcp')
let opcua = require('opcua')
let snap7 = require('snap7')
let startAt = new Date()
// benchmark: only and if only the reason for creation of a software
// orchestrate with profile/performance purpose
module.exports = {
	startAt: startAt,

	benchmarkModbusTCP: async function () {
		setTimeout(async function () {
			let livre = {}
			livre.start = new Date()
			log.debug(`>>start: ${new Date()}`)
			livre.ts1 = new Date().getTime()
			let repeats = 1000
			repeats = (repeats < 0 || repeats > 10000) ? repeats : 1000
			for (let i = 0; i < repeats; i += 1) {
				for (let j = 0; j < remotes.length; j += 1) {
					let sample = remotes[j]
					await modbustcp.acquire(
						sample.ip, sample.port, sample.subordinatorNumber, sample.functioncode, sample.register, sample.quantity, sample.timeoutMillisecond, sample.flash)
				}
			}
			livre.end = new Date()
			log.debug(`<<stop: ${new Date()}`)
			livre.ts2 = new Date().getTime()

			livre.interval = livre.end.getTime() - livre.start.getTime()
			log.mark(`${repeats} acquisition has consumpted ${livre.interval} long time`)

			//statistics
			const ms = (livre.ts2 - livre.ts1) * 1.0 / (repeats + 1)
			log.info(`average consumption milliseconds= ${ms} observed`)

			/// with above we measured network quality
			return ms;
		}, 9000)
	},

	benchmarkModbusRTU: async function () {
		setTimeout(async function () {
			let livre = {}
			livre.start = new Date()
			log.debug(`>>start: ${new Date()}`)
			livre.ts1 = new Date().getTime()
			let repeats = 1000
			repeats = (repeats < 0 || repeats > 10000) ? repeats : 1000
			for (let i = 0; i < repeats; i += 1) {
				for (let j = 0; j < remotes.length; j += 1) {
					let sample = remotes[j]
					await
						modbus.acquire(assembledAddress)
							.then((resp) => {
								console.log(resp)
							})
							.catch((error) => {
								// assembledAddress.unreachable = new Date()
								// assembledAddress.badResponse = assembledAddress.badResponse ? assembledAddress.badResponse + 1 : 1
								assembledAddress.alert = error
								console.log(error)
							})
				}
			}
			livre.end = new Date()
			log.debug(`<<stop: ${new Date()}`)
			livre.ts2 = new Date().getTime()

			livre.interval = livre.end.getTime() - livre.start.getTime()
			log.mark(`${repeats} acquisition has consumpted ${livre.interval} long time`)

			//statistics
			const ms = (livre.ts2 - livre.ts1) * 1.0 / (repeats + 1)
			log.info(`average consumption milliseconds= ${ms} observed`)

			/// with above we measured network quality
			return ms;
		}, 19000)
	},

	benchmarkOpcua: async function () {
		setTimeout(async function () {
			let livre = {}
			livre.start = new Date()
			log.debug(`>>start: ${new Date()}`)
			livre.ts1 = new Date().getTime()
			let repeats = 1000
			repeats = (repeats < 0 || repeats > 10000) ? repeats : 1000
			for (let i = 0; i < repeats; i += 1) {
				for (let j = 0; j < remotes.length; j += 1) {
					let sample = remotes[j]
					await opcua.acquire(sample)
					.then((resp) => {
						console.log(resp)
					})
					.catch((error) => {
						console.log(error)
					})
				}
			}
			livre.end = new Date()
			log.debug(`<<stop: ${new Date()}`)
			livre.ts2 = new Date().getTime()

			livre.interval = livre.end.getTime() - livre.start.getTime()
			log.mark(`${repeats} acquisition has consumpted ${livre.interval} long time`)

			//statistics
			const ms = (livre.ts2 - livre.ts1) * 1.0 / (repeats + 1)
			log.info(`average consumption milliseconds= ${ms} observed`)

			/// with above we measured network quality
			return ms;
		}, 29000)
	},
}
