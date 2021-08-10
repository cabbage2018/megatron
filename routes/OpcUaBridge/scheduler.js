'use strict'
let bridge = require('./bridge')
let cron = require('node-cron')
let report = require('./report')
let taskRoutine = null

let log4js = require('log4js')
let log = log4js.getLogger('bridge::scheduler')
let critical = log4js.getLogger('error')

module.exports = {
  setup: function setup(spacesAddress, mqttConnections) {
    // to minimize the downtime of this program, first level job will initialize a second onion task, which will disappear when finished.
    taskRoutine = cron.schedule('57 */1 * * * *', () => {
      var periodicJob4Reading = setTimeout(
        async () => {
          try{
            let resultsJSONObject = bridge.begin(spacesAddress, mqttConnections)
            console.log(resultsJSONObject)
          }
          catch(e){
            critical.fatal(e)
          }
        },
        3000
      )
      // log4js.shutdown()
    })
  
    taskRoutine.start()
  }
}

let hourlyReport = cron.schedule('58 39 */2 * * *', () => {
  let fs = require("fs")

  if(fs.existsSync(path.join(process.cwd(), './logs/errors.trp'))){
    const alarmString = fs.readFileSync(path.join(process.cwd(), './logs/errors.trp'))
    console.log(alarmString)
    report.postman('Emergency! Alarm fatal is coming!' + alarmString + ';\r\n then this source is deleted.')
    fs.unlinkSync(path.join(process.cwd(), './logs/errors.trp'))
    console.log('deleting: ', path.join(process.cwd(), './logs/errors.trp'))
  } else {
    report.postman('No communications error happened until now:)')
  }
})
hourlyReport.start()

let dailyReport = cron.schedule('29 59 */24 * * *', () => {
  const profilePerformance = bridge.profilingDictionary
  const profileString = JSON.stringify([...profilePerformance])
  console.log(profileString)
  report.postman('Hello performance profile is coming!' + profileString)
})
dailyReport.start()
