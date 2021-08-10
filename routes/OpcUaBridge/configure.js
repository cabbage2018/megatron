'use strict'
let path = require('path')
let fs = require('fs')

let scheduler = require('./scheduler')

let log4js = require('log4js')
let log = log4js.getLogger('routes::configure')
let critical = log4js.getLogger('error')
critical.error(new Date().toISOString() + 'softgateway is restarting now..., ')
log.error('Important! to bootstrap the error report system.', __dirname)

if (process.env.NODE_ENV === 'development') {

} else {
  
  let report = require('./report')
  report.postman(new Date().toISOString() + '; SI-MAC softgateway now is starting...')
  critical.error(new Date().toISOString() + '; SI-MAC softgateway now is starting...')
}
