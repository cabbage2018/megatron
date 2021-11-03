'use strict'
let scanner = require("./scanner")
let log4js = require('log4js')
let log = log4js.getLogger('routes::connectivity')
let _status = new Map()
// connectivity quick check
// benchmark

async function registers(address){
  await modbustcp.acquire(address.ip, address.port, address.sub, address.fc, address.register, address.count, address.timeout||5000, address.output||[0xf1,0xea])
  .then((resp) => {
    log.debug(resp)
    _status.set(address, resp)
  })
  .catch((err) => {
    log.error(err)
  })
}

async function device(collection){
  for(let i = 0; i < collection.array.length; i += 1) {
    let address = {}
    address.ip = collection.ip
    address.port = collection.port
    address.sub = collection.sub
    address.fc = collection.fc
    address.register = address.array[i].start
    address.count = address.array[i].quantity
    await registers(address)
  }
}

// with profile/performance purpose
module.exports.statistics = async function(spaces, repeats){
  let REPEATS = (repeats > 1 && repeats < 1000000)?repeats:10000
  log.trace(`address=${address}, repeats=${repeats}`)
  const startTimestamp = new Date().getTime()

  for(let i = 0; i < REPEATS; i = i + 1) {
    device(spaces)
  }

  const endTimestamp = new Date().getTime()
  const elapsed = endTimestamp - startTimestamp
  log.info(REPEATS + "-acquire's Profiled time consumed: ", elapsed, "'millisecond", "averaged:", elapsed * 1.0 / (REPEATS+1))
  /// with above we measured network quality
  return (endTimestamp - startTimestamp)*1.0 / 1000.0;
}

let job1 = setTimeout( async function() {
  await scanner.runAndWait()
}, 0) /* Minimum cycle in Node = 1ms and 50ms in Browser mightly */
