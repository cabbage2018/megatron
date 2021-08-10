'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')

let log4js = require('log4js')
let log = log4js.getLogger('bridge::scheduler')
let critical = log4js.getLogger('error')

let bridge = require('./bridge')
let report = require('./report')

  // to minimize the downtime of this program, first level job will initialize a second onion task, which will disappear when finished.
let taskRoutine = cron.schedule('57 */1 * * * *', () => {
    let periodicJob4Reading = setTimeout(async function () {
      
      let dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
      log.debug(dataSourceWrapper)

      let mqttConnectionOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json'))) 
      log.debug(mqttConnectionOptions)

      try{
        await bridge.runOnce(dataSourceWrapper, mqttConnectionOptions)
      }
      catch(e){
        critical.fatal(e)
      }
    }, 3000);    
    // log4js.shutdown()
  })
  
  taskRoutine.start()
// module.exports = {
//   setup: function setup(spacesAddress, mqttConnections) {
//   }
// }

let hourlyReport = cron.schedule('58 39 */2 * * *', () => {

  if(fs.existsSync(path.join(process.cwd(), './logs/errors.trp'))){
    let alarmString = fs.readFileSync(path.join(process.cwd(), './logs/errors.trp'))
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

  let profilePerformance = bridge.profilingDictionary
  let profileString = JSON.stringify([...profilePerformance])
  console.log(profileString)
  report.postman('Hello performance profile is coming!' + profileString)

})

dailyReport.start()
