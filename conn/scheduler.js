'use strict'
let daq = require('./daq')
let benchmark = require('./daq/benchmark')
let scan = require('./daq/scan')

function sleep(ms) {
	return new Promise(function (resolve, reject) {
		setTimeout(resolve, ms);
	})
}

sleep(60 * 1000)
	.then((res) => {
		scan.handle()
	})
	.catch((err) => {
		console.log(err)
	})
