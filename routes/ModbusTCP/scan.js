'use strict'
let fs = require('fs')
// let path = require('path')
let log4js = require('log4js')
let log = log4js.getLogger('routes::scan')
let modbustcp = require("./modbus")
let profilingDictionary = new Map()

function sleep(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, ms);
    })
  }

let accumulatedSpace = {
    channel: "modbustcp",
    repeatIntervalMs: 6000,
    protocolData: {
        ip: "127.0.0.1",
        port: 502,
        subordinatorNumber: 127,
        timeoutMs: 6000,
        functionType: 3
    },

    physicalAddress: {
        start: 23309,
        count: 100,
        registerGrid: [
            {start: 23309, count: 30, functionType: 3},
            {start: 23309, count: 30},
            {start: 23309, count: 30},
            {start: 23309, count: 30}
        ],
    }
}

function toBinaryString(inputBuffer){
    log.info("input buffer length", inputBuffer.byteLength)
    if(inputBuffer.byteLength === 2){
        var intValue = inputBuffer.readUInt16BE()
        if(typeof(intValue) === 'number'){
            const result = intValue.toString(2)
            const s = ("0000000000000000" + result)
            const paddedStringInt = s.substr(-16, 16)//16 bit position
            return paddedStringInt
        }
    }
    return "NaN.Binary"
}

function processResponse(response){
    let filenameAsString = `${response.request._body._start}_` +
    `${response.request._body._count}_` +
    `${response.request._body._fc}_` +
    ''
    //`${response.metrics.receivedAt.toISOString().replace(/[:./\\]/gi, "_")}`
    // /*.toLowerCase()*/

    fs.writeFileSync(filenameAsString + ".json", JSON.stringify(response), "utf8")
    const buffer = Buffer.from(response.response._body._valuesAsBuffer);
    const indexTitle = Number(response.request._body._start)
    log.debug(buffer.byteLength)
    log.debug(buffer)

    for (var offset = 0; offset < buffer.length/2; offset = offset + 1) {
        const focusedWord = buffer.slice(2 * offset, 2 * offset + 2)
        log.info("Reg: ", indexTitle + offset, ": ", focusedWord.toString('hex'))

        profilingDictionary.set(indexTitle + '_' + offset,
            {
                _val: focusedWord.readUInt16BE(),
                _valHex: focusedWord.toString('hex'),
                _valBin: toBinaryString(focusedWord),
                _ts: response.metrics.receivedAt,
                _fc: response.response._body._fc
            })
    }
    // already word/2bytes aligned~
    const stringArray = buffer.toString()
    log.debug(stringArray)
}

let acquireTask = setInterval(async function() {
}, accumulatedSpace.repeatIntervalMs || 1000)

function acquireOnce(){
    accumulatedSpace = require("./bootstrap/scan_config")
    accumulatedSpace = require('./SENTRON3WL-SIGNAL.json')
    log.warn(accumulatedSpace)
    const startTimestamp = new Date().getTime()
    log.debug("------>>>")
    for(var j = 0; j < accumulatedSpace.physicalAddress.registerGrid.length; j ++){
        let grid = accumulatedSpace.physicalAddress.registerGrid[j]
        /// RTU & TCP
        let internalSn = accumulatedSpace.protocolData.ip + '_' + accumulatedSpace.protocolData.port + '_' + accumulatedSpace.protocolData.subordinatorNumber + '_' + j
        accumulatedSpace.physicalAddress.start = Number(grid.register)
        accumulatedSpace.physicalAddress.count = Number(grid.quantity)
        accumulatedSpace.physicalAddress.functioncode = Number(grid.functioncode)

        //await
         sleep(0).
        then(async()=>{
            modbustcp.acquire(accumulatedSpace)
            .then((_response)=>{
                processResponse(_response)
                profilingDictionary.set(`${internalSn}_${grid.register}_${grid.quantity}_${grid.functioncode}`, _response)
            })
            .catch((error)=>{
                log.fatal(accumulatedSpace.physicalAddress.start, accumulatedSpace.physicalAddress.count)
                log.error(error)
                profilingDictionary.set(`${internalSn}_${grid.register}_${grid.quantity}_${grid.functioncode}`, error)
            })
        })
    }
    log.debug("<<<------")
    const endTimestamp = new Date().getTime()
    log.debug("Profiling: ", endTimestamp-startTimestamp, "'millisecond")
}


function startAcquireTask(){
    if(!acquireTask){        
        acquireTask = setInterval(async function() {
            acquireOnce();
        }, accumulatedSpace.repeatIntervalMs || 1000)

        return 'started'
    } else {
        clearInterval(acquireTask)                
        acquireTask = null
        return 'stopped'
    }
}

/// this may work with profile/performance purpose
function startAcquireTask2(){
    for(let i = 0; i < 1000; i = i + 1){
        acquireOnce();
    }
}

function stopAcquireTask(){
    if(acquireTask){
        clearInterval(acquireTask)                
        acquireTask = null
        return 'stopped'
    } else{
        return 'not started'
    }
}

module.exports = {
    profilingDictionary, startAcquireTask, stopAcquireTask
};