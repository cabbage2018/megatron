'use strict'
const express = require('express');
const router = express.Router();
const fs = require("fs")
const path = require('path')
let log4js = require('log4js');
let log = log4js.getLogger('routes::equipment');
const { v4: uuidv4 } = require('uuid')
/* 
*/
class equipment {

	constructor(options) {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.protocol = options.protocol;
		this.identity = "equipment instance";
		this.sn = uuidv4();
		this.spaces = undefined;
		this.uri = options.uri;
		this.online = false;
	}

	describe(){}
	addrModbustcp(){}
	addrSnap7(){}
	addrOpcua(){}
	
	connect(destination){
		switch(this.protocol){
			case "opcua":
				this.viaOpcua(destination);
			break;
			case "modbustcp":
				this.viaModbustcp(destination);
			break;
			case "snap7":
				this.viaSnap7(destination);
			break;
			
			default:
			break;

		}
	}

	viaModbustcp(options){
		let ip = options.ip;
		let port = options.port;
		let slave = options.slave;
		let sample = new modbustcp();
		return sample.connect({ip: ip, port: port, slave: slave??127})
		.then((result) => {
			log.debug(`handshake via modbus-tcp: ${result}`);
		})
		.catch((err) => {
			this.emit(`via modbus-tcp: ${err}`);
		});
	}

	viaOpcua(options){
		let host = options.host;
		let port = options.port;
		let sample = new modbustcp();
		return sample.connect(`tcp.opc://${host}:${port}`)
		.then((result) => {
			log.debug(`handshake via opcua: ${result}`);
		})
		.catch((err) => {
			this.emit(`via modbus-tcp: ${err}`);
		});
	}
	
	viaSnap7(options){
		let ip = options.ip;
		let rack = options.rack;
		let slot = options.slot;
		let sample = new modbustcp();
		return sample.connect({ip: ip, rack: rack, slot: slot})
		.then((result) => {
			log.debug(`handshake via snap7: ${result}`);
		})
		.catch((err) => {
			this.emit(`via modbus-tcp: ${err}`);
		});
	}

	viaModbusrtu(){}
	viaHttp(){}
	viaBacnet(){}
	viaProfibus(){}
	viaProfinet(){}
	viaIec104(){}
	viaIec61850(){}
	viaDatabase(){}

	online(){}
	Offline(){}
}
util.inherits(equipment, events.EventEmitter)
module.exports = equipment