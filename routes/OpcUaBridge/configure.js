'use strict'
let fs = require("fs")
let path = require("path")
let log4js = require('log4js')
let log = log4js.getLogger('routes::configure')
let critical = log4js.getLogger('error')
critical.error(new Date().toISOString() + 'softgateway is restarting now..., ')
log.error('Important! to bootstrap our error report system~')

/// non-deploy version
let dataSourceWrapper = require('../../config/opcuaspaces.json')
/* this way require() cannot work due to pkg only recognize literal! */
// let mqttConnectionOptions = require(path.join(__dirname, '../../config/mqttoptions.json'))
let mqttConnectionOptions = require('../../config/mqttoptions.json')

if (process.env.NODE_ENV === 'development') {

} else {
  /// packaged and distributed version
  dataSourceWrapper = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/opcuaspaces.json')))
  log.debug(dataSourceWrapper)

  mqttConnectionOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mqttoptions.json')))
  log.debug(mqttConnectionOptions)

  let report = require('./report')
  report.postman(new Date().toISOString() + '; SI-MAC softgateway now is starting...')
  
}

/// start routine as a timered job
let scheduler = require('./scheduler')
scheduler.setup(dataSourceWrapper, mqttConnectionOptions)
