'use strict'
let path = require('path')
let fs = require('fs')

let alert = require('./alert')
let scheduler = require('./scheduler')

let report = require('../report')

let log4js = require('log4js')
let email = log4js.getLogger('email')

email.error(`This machine[...process.env] is started and hope somebody received this startup message`)