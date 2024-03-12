'use strict'
let modbustcp = require('./modbustcp')
let opcua = require('./opcua')
let snap7 = require('./snap7')
let {probe} = require('./restful');
let emulator = require('./emulator')

// benchmark: only and if only the reason for creation of a software
// orchestrate with profile/performance purpose

(()=>{
	setTimeout(async function () {
		let livre = {}
		livre.start = new Date()
		livre.repeats = 10000

		for (let i = 0; i < livre.repeats; i += 1) {
			for (let j = 0; j < remotes.length; j += 1) {
				let sample = remotes[j]
				let remote = new modbus();
				await remote.connect(livre.uri);
				await remote.commissioning(livre.spaces)
				.then((response)=>{
					console.log(response);
				})
				.catch((error)=>{
					console.error(error);
				})
			}
		}
		livre.end = new Date()
		livre.interval = livre.end.getTime() - livre.start.getTime();
		log.mark(`modbustcp:: ${repeats} acquisition has consumpted ${livre.interval} long time`);
		/// with above we measured network quality
	}, 60000)
})

(()=>{
	setTimeout(async function () {
		let livre = {}
		livre.start = new Date()
		livre.repeats = 10000

		for (let i = 0; i < livre.repeats; i += 1) {	
			let sample = remotes[j]
			let remote = new opcua();
			await remote.connect(livre.uri);
			await remote.commissioning(livre.spaces)
			.then((response)=>{
				console.log(response);
			})
			.catch((error)=>{
				console.error(error);
			})
		}

		livre.end = new Date()
		livre.interval = livre.end.getTime() - livre.start.getTime();
		log.mark(`opcua:: ${repeats} acquisition has consumpted ${livre.interval} long time`);
		/// with above we measured network quality
	}, 90000)
})