'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')

let log4js = require('log4js')
let email = log4js.getLogger('email')
let log = log4js.getLogger('routes::alert')

log.info('There will not be any alert if system has generated no log equal to and above error')

function trigger(){

  if(fs.existsSync(path.join(process.cwd(), './logs/errors.trp'))) {
    let alarmString = fs.readFileSync(path.join(process.cwd(), './logs/errors.trp'))

    email.error(`${new Date().toISOString()} :\r\n\r\n ${alarmString} and;\r\n then this source is deleted.`)

    fs.unlinkSync(path.join(process.cwd(), './logs/errors.trp'))
    log.warn('deleting: ', path.join(process.cwd(), './logs/errors.trp'))

  } else {
    log.debug('what a nice day.')
  }
}
trigger();

let dailyReport = cron.schedule('49 59 */24 * * *', () => {
  // trigger()
})
dailyReport.start()