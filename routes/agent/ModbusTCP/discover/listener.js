'use strict'
var dgram = require("dgram")
let log4js = require('log4js')
let log = log4js.getLogger('routes::modbustcp::listener')
let remoteDictionary = new Map()
let port = 17008
var server = dgram.createSocket("udp4")

server.on("error", function (err) {
	log.error(err)
  server.close()
})

server.on("message", function (msg, remote) {
	log.info(msg, remote)
  remoteDictionary.set(remote, msg)
})

server.on("listening", function () {
	log.warn(address)
	let address = server.address()
})

server.bind(port)
module.exports = {remoteDictionary}