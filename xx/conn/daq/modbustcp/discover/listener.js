'use strict'
var dgram = require("dgram")
let log4js = require('log4js')
let log = log4js.getLogger('daq::modbustcp::listener')
let remoteDictionary = new Map()
let port = 17008
var server = dgram.createSocket("udp4");
server.on("listening", function () {
	let address = server.address();
	log.warn(address);
	log.info(`dgram udp4 start listening@ ${address}`);
})

server.on("error", function (err) {
	log.error(err)
	server.close()
})
server.on("message", function (msg, remote) {
	log.info(msg, remote)
	remoteDictionary.set(remote, msg)
})
server.bind(port, '127.0.0.1')
module.exports = { remoteDictionary }