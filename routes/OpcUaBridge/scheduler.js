'use strict'
let bridge = require('./bridge')
let cron = require('node-cron')
let log4js = require('log4js')
let email = log4js.getLogger('bridge::scheduler')
let report = require('./report')
report.postman('Hello email!')

// to minimize the downtime of this program, first circle job will initialize a second onion task, which will disappear when finished. 
let taskRoutine = cron.schedule('57 */1 * * * *', () => {
  var periodicJob4Reading = setTimeout(
    async () => {
      try{
        let spaceIndicator = require('./spaces.json')
        let spacesAddress = spaceIndicator

        // let resultsJSONObject = bridge.query(spacesAddress)
        // .then(async (responseValues)=>{
        //   let deliverRecords = await bridge.deliver(responseValues)
        //   log.info(deliverRecords)
        // })
        // .catch((err)=>{
        //   // email.fatal(err)
        // })

      }
      catch(e){
        // report.postman(e)
        // email.fatal(e)
      }
    },
    3000
  )
  // log4js.shutdown()
})
taskRoutine.start()

let profilePerformance = bridge.profilingDictionary
let alarmString = JSON.stringify([...profilePerformance])
email.error(alarmString)
console.log(alarmString)
let hourlyReport = cron.schedule('30 30 */1 * * *', () => {
})
hourlyReport.start()

let dailyReport = cron.schedule('59 59 */24 * * *', () => {
})
dailyReport.start()
