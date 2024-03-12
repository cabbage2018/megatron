'use strict'
const request = require('supertest')
const path = require('path')
const fs = require('fs')
const log4js = require('log4js')
const log = log4js.getLogger(':RESTful:')
const util = require('util')
const events = require('events')

class probe {
	constructor() {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.protocol = "restful";
		this.identity = "modbustcp plugin";
		this.crawler = undefined;
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

	testOnline(options){
		let that = this;
	}

	sn(){}
	connect(options = null) {
		let that = this;
	}

	commissioning(spaces){
		let that = this;
		// let url = `https://${this.host}:${this.port}/${this.midamble}`
		// let requestId = this.requestId
		// let connectionId = this.connectionId
		// let access_token = this.access_token
		return new Promise(function (resolve, reject) {
			request(spaces.url)
				.post(`${spaces.serverPath}`)
				.set('Access-Control-Allow-Origin', '*')
				.set('Content-Type', 'application/json')
				.set('Authorization', `Bearer ${spaces.token}`)
				.send('')
				.end(function (err, res) {
					if (err) {
						access.error(`url:${url}, post, ${spaces.serverPath}, ${err}`)
						reject(err)
					} else {
						access.debug(`url:${url}, res:${res.body}`)
						resolve(res.body)
					}
				})
		})
	}

}

util.inherits(probe, events.EventEmitter)
module.exports = probe
// A RESTful API is an architectural style for an application program interface(API) that uses HTTP requests to access and use data.That data can be used to GET, PUT, POST and DELETE data types, which refers to the reading, updating, creating and deleting of operations concerning resources.
// Representational State Transfer

// 2023.04.24:17: