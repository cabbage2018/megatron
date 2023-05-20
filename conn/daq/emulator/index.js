"use strict";
const util = require('util')
const events = require('events')
const cache = (o) => { fs.writeFileSync(path.join(process.cwd(), this.cacheFilePath), JSON.stringify(o), 'utf-8') }
const request = require('supertest')
const path = require('path')
const fs = require('fs')
const log4js = require('log4js')
const log = log4js.getLogger(':emulator:')

class emulator {
	/**
	 * 
	 */
	constructor() {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.protocol = "emu";
		this.identity = "emulator plugin";
	}

	register(callback) {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, 0)
			.then(function (){
				callback;
			})
			.catch(function (){
				console.log(`rejected @${__filename},`);
				reject("rejected @emulator");
			});
		});
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
	testOnline(){}
	sn(){}

	connect(url = null) {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, 0);
		})
	}
}
util.inherits(emulator, events.EventEmitter)
exports.emulator = emulator