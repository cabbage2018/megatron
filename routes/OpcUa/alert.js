'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')
let log4js = require('log4js')
let email = log4js.getLogger('email')
let log = log4js.getLogger('routes::alert')

log.info('There will not be any alert if system has generated no log equal to and above error')

let textFilename = '/logs/errors.log'
function outputLogsAndClean(){
  let alarmString = fs.readFileSync(path.join(process.cwd(), textFilename))
  email.error(`${new Date().toISOString()} :\r\n\r\n ${alarmString} and;\r\n then this source is deleted.`)

  setTimeout(()=>{
    log.warn('deleting: ', path.join(process.cwd(), textFilename))
    fs.unlinkSync(path.join(process.cwd(), textFilename))
  }, 10000)
}
outputLogsAndClean()

function scan(){
  if(fs.existsSync(path.join(process.cwd(), textFilename))) {
    outputLogsAndClean()
  } else {
    log.mark('what a nice day.')
  }
}
// scan();

let dailyScan = cron.schedule('49 59 */24 * * *', () => {
  scan()
})

dailyScan.start()