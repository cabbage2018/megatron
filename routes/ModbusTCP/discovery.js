'use strict'
var express = require('express');
var router = express.Router();
let modbustcp = require("./modbus")
let log4js = require('log4js')
let tracer = log4js.getLogger('routes::discovery')

let candidateIpAddress = {
    channel: "modbustcp",
    repeatIntervalMs: 6000,
    protocolData: {
        ip: "192.168.2.139",
        port: 502,
        subordinatorNumber: 127,
        timeoutMs: 600,
        functionType: 1
    },

    physicalAddress: {
        start: 23309,
        count: 2,
        registerGrid: [
            {start: 23309, count: 1}
        ],
    }
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

            modbustcp.acquire(candidateIpAddress)
            .then((_response)=>{
            })
            .catch((error)=>{
              if(error.connected !== null && error.connected !== undefined){
                modbusTCPDictionary.set(error.connected.ip, error.connected.port)

                tracer.fatal(error.connected)

              }
                // tracer.debug(error)
            })
        })
    }
    const endMoment = new Date().getTime()
    tracer.warn("Profiling: ", endMoment-startMoment, " millisecond")

}, candidateIpAddress.repeatIntervalMs)

sleep(30000)
.then( async ()=>{
  tracer.fatal(modbusTCPDictionary)
})
.catch((error)=>{
})

router.get('/', (req, res) => {

  const obj = modbusTCPDictionary
	res.render('dic', {
        title: __filename + new Date().toISOString(),
        items: obj
    })
})

module.exports = router;

