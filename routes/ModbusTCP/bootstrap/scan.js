'use strict'
let modbustcp = require("./modbus")
function sleep(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, ms)
    })
}
let accumulatedSpace = require("./SENTRON3WL.layout.js")/*{
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
            {start: 23309, count: 30},
            {start: 23309, count: 30},
            {start: 23309, count: 30},
            {start: 23309, count: 30}
        ],
    }
}*/

function toBinaryString(inputBuffer){
    if(inputBuffer.byteLength === 2){
        var intValue = inputBuffer.readUInt16BE()
        if(typeof(intValue) === 'number'){
            const result = intValue.toString(2)
            const s = ("0000000000000000" + result)
            const paddedStringInt = s.substr(-16, 16)//16 bit position
            return paddedStringInt
        }
    }
    return "NaN"
}

function processResponse(rawResponse){
  let filename = response.request._body._start + "_" + response.request._body._count + "_" + response.request._body._fc + "_" 
  // response.metrics.receivedAt.toISOString()/*.toLowerCase()*/.replace(/[:./\\]/gi, "_")
  fs.writeFileSync(filename + ".txt", JSON.stringify(response), "utf8")
}

setInterval(async function() {    
  const start = new Date().getTime()
  for(var j = 0; j < accumulatedSpace.physicalAddress.registerGrid.length; j ++){
      let grid = accumulatedSpace.physicalAddress.registerGrid[j]
      accumulatedSpace.physicalAddress.start = grid.start
      accumulatedSpace.physicalAddress.count = grid.count
      await sleep(1)
      .then(async()=>{
          modbustcp.acquire(accumulatedSpace)
          .then((_response)=>{
              processResponse(_response)
          })
          .catch((error)=>{
              console.log(error)
          })
      })
  }
  const end = new Date().getTime()
  console.log(`end-start: ${end-start} millisecond`)
}, 6000000)

sleep(6000)
.then( async ()=>{
})
.catch((error)=>{
})