'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')

let log4js = require('log4js')
let email = log4js.getLogger('email')

function scan(){
  if(fs.existsSync(path.join(process.cwd(), './logs/errors.trp'))) {
    let alarmString = fs.readFileSync(path.join(process.cwd(), './logs/errors.trp'))

    email.error(`${new Date().toISOString()} :\r\n\r\n ${alarmString} and;\r\n then this source is deleted.`)
    fs.unlinkSync(path.join(process.cwd(), './logs/errors.trp'))
    log.warn('deleting: ', path.join(process.cwd(), './logs/errors.trp'))

  } else {
    email.debug('what a nice day(this message will not be delivered).')
  }
}

let dailyScan = cron.schedule('58 59 */24 * * *', () => {
  scan()
})

dailyScan.start()

scan();