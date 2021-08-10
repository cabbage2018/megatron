'use strict'
let path = require('path')
let fs = require('fs')
let log4js = require('log4js')
let log = log4js.getLogger('routes::configure')
let critical = log4js.getLogger('error')
critical.error(new Date().toISOString() + 'softgateway is restarting now..., ')
log.error('Important! to bootstrap the error report system.', __dirname)

/// non-deploy and dist- version
let dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/opcuaspaces.json')))

/* this way require() cannot work due to pkg only recognize literal! */
let mqttConnectionOptions = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/mqttoptions.json'))) 

if (process.env.NODE_ENV === 'development') {

} else {
  dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
  log.debug(dataSourceWrapper)

  mqttConnectionOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json')))
  log.debug(mqttConnectionOptions)

  let report = require('./report')
  report.postman(new Date().toISOString() + '; SI-MAC softgateway now is starting...')
  critical.error(new Date().toISOString() + '; SI-MAC softgateway now is starting...')
}

let scheduler = require('./scheduler')
scheduler.setup(dataSourceWrapper, mqttConnectionOptions)
