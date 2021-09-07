'use strict'
let path = require('path')
let fs = require('fs')

let alert = require('./alert')
let report = require('./report')
let scheduler = require('./scheduler')

let log4js = require('log4js')
let email = log4js.getLogger('email')

// email.error(`This machine[...process.env] is started and hope somebody received this startup message`)