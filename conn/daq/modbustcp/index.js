"use strict";
const util = require('util')
const events = require('events')
// const cache = (o) => { fs.writeFileSync(path.join(process.cwd(), this.cacheFilePath), JSON.stringify(o), 'utf-8') }
// const request = require('supertest')
const path = require('path')
const fs = require('fs')

let modbus = require('jsmodbus')// Master or initiator
let net = require('net')

const log4js = require('log4js')
const log = log4js.getLogger(':modbustcp:')

class modbustcp {
	/**
	 * must have: ip, port, 
	 * 
	 * ambiguous: slave#, 
	 * 
	 * optional: fc, register, count, 
	 * 
	 * timeout, 
	 * write buffer
	 * ::promisePhysicalLayer
	 * 
	 */
	constructor() {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.protocol = "modbustcp";
		this.identity = "modbustcp plugin";
		this.client = undefined;
	}

	connect() {
		let that = this;
		let ip = options.Ip;
		let port = options.Port;
		let slave = options.Slave;

		return new Promise(function (resolve, reject) {
			that.socket = new net.Socket();
			that.client = new modbus.client.TCP(that.socket, options.slave ? options.slave : 127, options.timeoutMilli ? options.timeoutMilli : 4000);

			that.socket.on('connect', function () {
				resolve(that.client);
			});

			that.socket.on('error', (error) => {
				// error.ip = ip
				// error.port = port
				that.socket.end()
				reject(error)
			});

			that.socket.connect({
				'host': ip,                             //'192.168.2.42',
				'port': port,                           //'502'
			});

		});
	}

	commissioning(spaces) {
		let that = this;
		return new Promise(function (resolve, reject) {
			if (that.client) {
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
							this.emit('data', resp)

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
module.exports/*.modbustcp*/ = modbustcp
