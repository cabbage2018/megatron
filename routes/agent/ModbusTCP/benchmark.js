'use strict'
let scanner = require("./scanner")
let log4js = require('log4js')
let log = log4js.getLogger('routes::benchmark')
// benchmark: only and if only the reason for creation of a software
setTimeout(async function() {
  let livre = {}
  livre.start = new Date()
  log.debug(`>>start: ${new Date()}`)

  for(let i = 0; i < 1000; i += 1) {
    let address = {}
    address.ip = collection.ip
    address.port = collection.port
    address.sub = collection.sub
    address.fc = collection.fc
    address.register = address.array[i].start
    address.count = address.array[i].quantity
    await scanner.read(address)
  }

  livre.end = new Date()
  livre.interval = livre.end.getTime() - livre.start.getTime() 
  log.mark(`1000 acquisition has consumpted ${livre.interval} long time`)
}, 30000)
