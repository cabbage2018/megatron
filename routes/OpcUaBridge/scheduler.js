'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')

let log4js = require('log4js')
let log = log4js.getLogger('bridge::scheduler')

let bridge = require('./bridge')

async function triggerOnce(dataSourceWrapper, mqttConnectionOptionArray) {
  try{
    if (process.env.NODE_ENV/*process.env.npm_package_env*/ === 'development') {
      await bridge.quickCheck(dataSourceWrapper, mqttConnectionOptionArray)
    } else {
      await bridge.runOnce(dataSourceWrapper, mqttConnectionOptionArray)
    }        
  }
  catch(e){
    log.fatal(e)
  }
}

function initializeTimer(minutesSeries, dataSourceWrapper, mqttConnectionOptionArray){
  for(let i = 0; i < minutesSeries; i = i+ 1) {
    let periodicJob4Reading = setTimeout(async function () {
      log.fatal( i + '\'th round: cron.schedule(\'45 */60 * * * *\', () => {...........')
      await triggerOnce(dataSourceWrapper, mqttConnectionOptionArray)
    }, 1000*60*i);
  }
}
  /*
   to minimize the downtime of this program, 
   first level job will initialize a second onion task, [deleted]
   which will disappear when finished.[deleted]

   new idea is set up a series of fixed intervals for iterate,
   like 1,2,3,5,10,15,30,60 min 
   the unmarked interval fall in the floor one[deleted]

   recover the privious version, big circle is 60 min,
   and then set up a series of timer from 1 min to 60 min range.

  */
let taskRoutine = cron.schedule('45 */60 * * * *', () => {

  /// update settings properties every big interval = 60 min
  let dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
  log.debug(dataSourceWrapper.updateIntervalMillisecond)

  let mqttConnectionOptionArray = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json'))) 
  log.debug(mqttConnectionOptionArray)

  let ms = dataSourceWrapper.updateIntervalMillisecond || 300000
  let intervalSeconds = (ms)/ 1000
  if(intervalSeconds < 60) {
    intervalSeconds = 60
    let howManyMinutes = intervalSeconds / 60
    let iteratesWithin60Minutes = 60 / howManyMinutes
    initializeTimer(iteratesWithin60Minutes, dataSourceWrapper, mqttConnectionOptionArray)

  } else if (intervalSeconds > 3599) {
    /// execute at once, 1 time
    let periodicJob4Reading = setTimeout(async function () {
      await triggerOnce(dataSourceWrapper, mqttConnectionOptionArray)
    }, 10000);

  } else {
    /// between 1 and 60 min
    let howManyMinutes = intervalSeconds / 60    
    let iteratesWithin60Minutes = 60 / howManyMinutes
    initializeTimer(iteratesWithin60Minutes, dataSourceWrapper, mqttConnectionOptionArray)
    
  }

  // log4js.shutdown()
})
taskRoutine.start()
