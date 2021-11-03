'use strict'
let log4js = require('log4js')
let log = log4js.getLogger('routes::scheduler')
let cron = require('node-cron')

let scanner = require("./scanner")
let _status = new Map()

const taskPool = {}
let secondsTask = setInterval(async function() {
    log.info('secondsTask triggered...')
}, 6*1000);
let hourlyRoutine = cron.schedule('0 * */1 * * *', () => {
    log.debug('cron not ready yet')
});
taskPool['hourlyRoutine'] = hourlyRoutine

function scheduleLongtermRoutine(projets, models){
    hourlyRoutine = cron.schedule('0 * */1 * * *', async () => {
        await scheduleLongtermRoutine(projets, models)//
    })
}

let pace = 1

module.exports.schedule = async function(projets, models){

  clearInterval(secondsTask)

  pace = pace* 2
  
  secondsTask = setInterval(async function() {
      await scheduleShorttermRoutine(projets, models)
  }, pace || 1000)

  // immediately run, for specific repeats
  await scheduleShorttermRoutine(projets, models)
  
  scheduleLongtermRoutine(projets, models)
}

module.exports.shutdown = async function(){
  if(secondsTask){
      clearInterval(secondsTask)
      secondsTask = null
  }
  let startedRoutine = taskPool['hourlyRoutine']
  startedRoutine.stop();
}