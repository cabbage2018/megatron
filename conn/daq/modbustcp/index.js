"use strict";
const util = require('util')
const events = require('events')
const cache = (o) => { fs.writeFileSync(path.join(process.cwd(), this.cacheFilePath), JSON.stringify(o), 'utf-8') }
const request = require('supertest')
const path = require('path')
const fs = require('fs')
const log4js = require('log4js')
const log = log4js.getLogger(':modbustcp:')

class modbustcp {
	/**
	 * 
	 */
	constructor() {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.identity = "modbustcp plugin";
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

	connect(options = null) {
		let that = this;

		return new Promise(function (resolve, reject) {
			const socket = new net.Socket();
			that.client = new modbus.client.TCP(socket, options.slave, options.timeoutMilli);

			socket.on('connect', function () {
				resolve(that.client);
			});

			socket.on('error', (error) => {
				error.ip = ip
				error.port = port
				socket.end()
				reject(error)
			});

			socket.connect({
				'host': ip,                             //'192.168.2.42',
				'port': port,                           //'502'
			});

		});
	}

	commissioning(spaces){
		let that = this;
		return new Promise(function (resolve, reject) {			
			if(that.client){
				let client = that.client;

				switch (spaces.fc) {
					case 1:
						client.readCoils(register, count).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						})
						break;
	
					case 2:
						client.readDiscreteInputs(register, count).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						})
						break;
	
					case 3:
						client.readHoldingRegisters(register, count).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						});
						break;
	
					case 4:
						client.readInputRegisters(register, count).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						});
						break;
	
					case 5:
						client.writeSingleCoil(register, outputs).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						});
						break;
	
					case 6:
						client.writeSingleRegister(register, outputs).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						});
						break;
	
					case 15:
						client.writeMultipleCoils(register, outputs).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						});
						break;
	
					case 16:
						client.writeMultipleRegisters(register, outputs).then(function (resp) {
							socket.end()
							resolve(resp)
						}).catch(function (error) {
							error.detail = entry
							socket.end()
							reject(error)
						});
						break;
	
					default:
						socket.end()
						reject('Unsupported function code =' + fc + '##')
						break;
				}//switch()
			} else {
				reject(`error while acquire remote unit@ ${__filename}`);
			}
		})
	}
}
util.inherits(modbustcp, events.EventEmitter)
exports.modbustcp = modbustcp