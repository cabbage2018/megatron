'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')

let log4js = require('log4js')
let log = log4js.getLogger('bridge::scheduler')

async function triggerOnce(dataSourceWrapper, mqttConnectionOptionArray) {

  let bridge = require('./bridge')

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

let dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
log.debug(dataSourceWrapper.updateIntervalMillisecond)

let mqttConnectionOptionArray = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json'))) 
log.debug(mqttConnectionOptionArray[0])

let intervalObj = setInterval(async() => {
  dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
  log.debug(dataSourceWrapper.updateIntervalMillisecond)

  mqttConnectionOptionArray = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json'))) 
  log.debug(mqttConnectionOptionArray[0])

  await triggerOnce(dataSourceWrapper, mqttConnectionOptionArray)  
  log.fatal( ' setInterval(() => { ' + new Date().toISOString())
}, dataSourceWrapper.updateIntervalMillisecond || 300000);



  /*
   to minimize the downtime of this program, 
   first level job will initialize a second onion task, [deleted]
   which will disappear when finished.[deleted]

   new idea is set up a series of fixed intervals for iterate,
   like 1,2,3,5,10,15,30,60 min 
   the unmarked interval fall in the floor one[deleted]

   recover the privious version, big circle is 60 min,
   and then set up a series of timer from 1 min to 60 min range.

   August 12: finally apply setInterval to an cron task to adjust interval job every hour

  */
let taskRoutine = cron.schedule('45 */60 * * * *', () => {

  clearInterval(intervalObj);

  if(fs.existsSync(path.join(process.cwd(), './config/opcuaspaces.json')) 
    && fs.existsSync(path.join(process.cwd(), './config/mqttoptions.json'))) {

      intervalObj = setInterval(async() => {
        dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
        log.debug(dataSourceWrapper.updateIntervalMillisecond)
      
        mqttConnectionOptionArray = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json'))) 
        log.debug(mqttConnectionOptionArray[0])
      
        await triggerOnce(dataSourceWrapper, mqttConnectionOptionArray)
        log.info( ' setInterval(() => { ' + new Date().toISOString())
    
      }, dataSourceWrapper.updateIntervalMillisecond || 300000);
    }

  // log4js.shutdown()
})
taskRoutine.start()
