'use strict'
let modbus = require('jsmodbus')// Master or initiator
let net = require('net')

function acquire(ip, port, sub, fc, register, count, timeout, outputs = null) {
	if (typeof (ip) !== 'string') {
		throw new Error('Wrong IP')
	}
	if (typeof (port) != 'number' || port < 0) {
		throw new Error('Wrong port Number')
	}
	if (typeof (sub) != 'number' || sub > 126 || sub < 0) {
		throw new Error('Wrong subordinator Number')
	}
	if (typeof (fc) != 'number' || fc > 126 || fc < 0) {
		throw new Error('Wrong function code Number')
	}
	if (typeof (register) != 'number' || register < 0) {
		throw new Error('Wrong register Start')
	}
	if (typeof (count) != 'number' || count < 0) {
		throw new Error('Wrong register count')
	}
	if (count > 127) {
		throw new Error(`cannot access ${count} registers at one time! the maximum you can do is 127`)
	}
	if (typeof (outputs) != 'object' || count < 0) {
		throw new Error('Wrong outputs count')
	}
	const ms = (timeout > 60000 || timeout < 0) ? 3000 : timeout
	let entry = {
		ip: ip,
		port: port,
		slave: sub,
		fc: fc,
		reg: register,
		count: count,
		timeout: ms
	}
	let promisePhysicalLayer = new Promise(function (resolve, reject) {
		
	})
	return promisePhysicalLayer
}

function access(ip, port, sub) {
	const ms = 3000
	let entry = {
		ip: ip,
		port: port,
		slave: sub,
	}
	let promisePhysicalLayer = new Promise(function (resolve, reject) {
		const socket = new net.Socket();
		const client = new modbus.client.TCP(socket, sub, ms)
		socket.on('connect', function () {
			resolve(resp)
		})
		socket.on('error', (error) => {
			error.detail = entry
			socket.end()
			reject(error)
		})
		socket.connect({
			'host': ip,                             //'192.168.2.42',
			'port': port,                           //'502'
		})
	})
	return promisePhysicalLayer
}

module.exports = { acquire, access }