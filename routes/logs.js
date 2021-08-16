'use strict'

let log4js = require('log4js')
let path = require('path')
let fs = require('fs')

if (process.env.NODE_ENV === 'development') {
  log4js.configure({
    "appenders": {

      "console": {
        "type": "console",
        "pattern": "%d %p %c %m%n"
      },

      "debug": {
        "type": "dateFile",
        "filename": path.join(process.cwd(), '../logs/debug'),
        "pattern": "yyyy-MM-dd",
        "compress": true,
        "alwaysIncludePattern": true,
      },

      "out": {
        "type": "stdout",
        "layout": {
          "type": "pattern",
          "pattern": "%d %p %c %m%n"
          }
        }
      },
      "categories": {
        "default": { "appenders": ["console", "debug"], "level": "all" }
      }
    })

} else {

  // as minimum as possible to save disk
  let mailconfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/mailoptions.json')))
  
  log4js.configure({
    appenders: {

      request: {
        type: 'dateFile',
        filename: path.join(process.cwd(), './logs/request'),
        pattern: 'yyyy-MM-dd',
        compress : true,
        alwaysIncludePattern: true,
      },
      error: {
        type: 'file',
        maxLogSize: 8388608,
        backups: 7,
        compress : true,
        keepFileExt : true,
        filename: path.join(process.cwd(), './logs/errors.trp'),
      },
      other: {
        type: 'file',
        maxLogSize: 8388608,
        backups: 8,
        compress : true,
        keepFileExt : true,
        filename: path.join(process.cwd(), './logs/livre.log'),
        alwaysIncludePattern: true,
      },
      email: {
        //发送错误报告至邮箱
        type: '@log4js-node/smtp',
        sender: mailconfig.email.sender, 
        subject: mailconfig.email.subject,
        SMTP: {
          host: mailconfig.email.host, 
          port: mailconfig.email.port,
          // secure: true,
          // secureConnection: true, // 使用 SSL
          // tls: {
          //   // do not fail on invalid certs
          //   rejectUnauthorized: false
          // },
          auth: mailconfig.email.auth //auth { user: 'xxx@qq.com', pass: '密码' }
        },
        attachment: {
          enable: true,
          filename: path.join(process.cwd(), './logs/errors.trp'),
          message: `See the attached latest runtime report ${__filename}, ${process.cwd()}, ${new Date().toISOString()};`
        },
        // sendInterval: 3600*1,
        recipients: mailconfig.email.recipients,
      },
    },

    categories: {
      default: { appenders: ['other'], level: 'warn' },
      error: { appenders: ['error'], level: 'error' },
      email: { appenders: ['email'], level: 'warn' },
      other: { appenders: ['other'], level: 'fatal' },
      request: { appenders: ['request'], level: 'debug' }
    },
  })
}

const log = log4js.getLogger('bin:www')
if (process.env.NODE_ENV === 'development') {
  log.mark(`${process.env.NODE_ENV}`)
  // log.mark(`${process.env.npm_package_env}`)
} else {
  log.warn(process.env)
}
