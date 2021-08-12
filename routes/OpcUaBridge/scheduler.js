'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')

let log4js = require('log4js')
let log = log4js.getLogger('bridge::scheduler')

let bridge = require('./bridge')

  /*
   to minimize the downtime of this program, 
   first level job will initialize a second onion task, 
   which will disappear when finished.
  */
let taskRoutine = cron.schedule('45 */5 * * * *', () => {

  let dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
  log.debug(dataSourceWrapper.updateIntervalMillisecond)

  let mqttConnectionOptionArray = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json'))) 
  log.debug(mqttConnectionOptionArray)

  let ms = dataSourceWrapper.updateIntervalMillisecond || 300000
  let intervalSeconds = (ms)/ 1000
  if(intervalSeconds < 60 || intervalSeconds > 900){
    intervalSeconds = 300
  }
  let howManyMinutes = intervalSeconds / 60
  if(howManyMinutes > 5) {
    let periodicJob4Reading = setTimeout(async function () {  
      log.fatal('cron.schedule(\'45 */5 * * * *\', () => {...........')  
      try{
        if (/*process.env.NODE_ENV*/ process.env.npm_package_env === 'development') {
          await bridge.quickCheck(dataSourceWrapper, mqttConnectionOptionArray)
        } else {
          await bridge.runOnce(dataSourceWrapper, mqttConnectionOptionArray)
        }        
      }
      catch(e){
        log.fatal(e)
      }
    }, 1000*60*2.5);
  } else {
    let cyclesIn15Minutes = 15 / howManyMinutes
    for(let i = 0; i < cyclesIn15Minutes; i = i+ 1) {
      let periodicJob4Reading = setTimeout(async function () {  
        log.fatal('cron.schedule(\'45 */15 * * * *\', () => {...........')  
        try{  
          if (/*process.env.NODE_ENV*/ process.env.npm_package_env === 'development') {
            await bridge.quickCheck(dataSourceWrapper, mqttConnectionOptionArray)
          } else {
            await bridge.runOnce(dataSourceWrapper, mqttConnectionOptionArray)
          }        
        }
        catch(e){
          log.fatal(e)
        }
      }, 1000*60*i*howManyMinutes);
    }
  }
  // log4js.shutdown()
})
taskRoutine.start()
