'use strict'
let bridge = require('./bridge')
let cron = require('node-cron')
let log4js = require('log4js')
let log = log4js.getLogger('bridge::scheduler')
let email = log4js.getLogger('email')
// to minimize the downtime of this program, first circle job will initialize a second onion task, which will disappear when finished. 

let taskRoutine = cron.schedule('57 */1 * * * *', () => {

  var periodicJob4Reading = setTimeout(
    async () => {
      let spacesAddress = require('./configure').load('./spaces.json')
      let resultsJSONObject = bridge.query(spacesAddress)
      .then(async (responseValues)=>{
        let deliverRecords = await bridge.deliver(resultsJSONObject)
      })
      .catch((err)=>{
        email.error({t: new Date(), e: err})
      })

    },
    3000
  )
  
  log.debug(periodicJob4Reading)

})

taskRoutine.start()