'use strict'
let modbustcp = require("../modbus")
let log4js = require('log4js')
let log = log4js.getLogger('routes::discovery')

/*
  possible way 1: try to connect to specific IP address/port 
  possbile way 2: UDP broadcast to SENTRON / EP-E
  possible way 3: MAC broadcast to SIRIUS / EP-I(more like SIMATIC)
  
*/

let candidateIpAddress = {
  repeatIntervalMillisecond: 6000,

  protocolData: {
    "desc": "ACB#1",
    ip: "192.168.2.139",
    port: 502,
    subordinatorNumber: 127,
    timeoutMillisecond: 600
  },

  "register": 42240,
  "quantity": 97,
  "signals": "4.5.27 Data set DS 165: Identification comment",
  "functioncode": 3
}

function sleep(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, ms);
    })
  }

let modbusTCPDictionary = new Map()

setTimeout( async function() {

    const startMoment = new Date().getTime()
    let refip = "192.168.2"

    for(var j = 1; j < 255; j ++){

        await sleep(50).
        then(async()=>{

          candidateIpAddress.protocolData.ip = refip + "." + j
            
          await modbustcp.acquire(candidateIpAddress)
            .then((_response) => {

              modbusTCPDictionary.set(error.connected.ip, "target connectable.")

            })
            .catch((error) => {
              log.fatal(candidateIpAddress, error)
            })
        })
    }
    const endMoment = new Date().getTime()
    log.warn("Profiling: ", endMoment-startMoment, " millisecond")

}, 30000)

sleep(130000)
.then( async ()=>{
  log.fatal(modbusTCPDictionary.size)
  for (let entry in modbusTCPDictionary) {
    log.debug(entry[0], entry[1])
   }
})
.catch((error)=>{
})

