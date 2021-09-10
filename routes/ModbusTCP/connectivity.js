'use strict'
let modbustcp = require("./modbus")
let log4js = require('log4js')
let log = log4js.getLogger('routes::scan')
let REPEATS = 100

function sleep(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  })
}
module.exports = {

  /// this may work with profile/performance purpose
  statistics: async function statistics(address, layout, model) {
    const startTimestamp = new Date().getTime()

    for(let i = 0; i < REPEATS; i = i + 1) {
      for(let ad = 0; ad < address.array.length; ad += 1) {
        for(let la = 0; la < layout.array.length; la += 1) {
          let ensembleAddress = {}
          ensembleAddress = layout.array[la]
          ensembleAddress.protocolData = address.array[ad]

          // await modbustcp.acquire(ensembleAddress)
          await modbustcp.acquire(ensembleAddress)
            .then((resp) => {
              if (ensembleAddress.accessible) {
                ensembleAddress.accessible += 1
              } else {
                ensembleAddress.accessible = 1
              }
              ensembleAddress.lastupdated = new Date()
              // console.log(resp)
            })
            .catch((err) => {
              log.error(err)
            })

        }


        await sleep(10)
          .then(async (res) => {
          })
          .catch((err) => { ; })

      }
    }

    const endTimestamp = new Date().getTime()
    const elapsed = endTimestamp - startTimestamp
    log.debug(REPEATS + "-acquire's Profiled time consumed: ", elapsed, "'millisecond", "averaged:", elapsed * 1.0 / (REPEATS+1))

    /// with above we measured network quality
    return (endTimestamp - startTimestamp)*1.0 / 1000.0;
  }

};
