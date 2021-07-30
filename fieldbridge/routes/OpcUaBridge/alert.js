'use strict'
let log4js = require('log4js')
let config = require('./options.json')

log4js.configure({
  appenders: {
    stdout: {
      //控制台输出
      type: 'stdout',
    }, 
    request: {
      //请求日志
      type: 'dateFile',
      filename: '/logs/request', // 需要手动建好目录,如图1所示
      // 指定pattern后无限备份
      pattern: 'yyyy-MM-dd_access.log',
      // 不指定pattern时若为true会使用默认值'.yyyy-MM-dd'
      alwaysIncludePattern: true,
    },
    error: {
      //错误日志
      type: 'dateFile',
      filename: '/logs/error',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
    },
    fatal: {
      type: 'dateFile',
      filename: '/logs/error',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
    },
    other: {
      //其他日志
      type: 'file',
      maxLogSize: 8388608,
      backups: 3,
      compress : true,
      keepFileExt : true,
      filename: '/logs/other',
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
    },
    email: {
      //发送错误报告至邮箱
      type: '@log4js-node/smtp',
      sender: config.email.sender, //发送邮件的邮箱
      subject: config.email.subject, //标题
      SMTP: {
        host: config.email.host, //smtp.qq.com 这里我使用了QQ邮箱，你可以换成其他
        port: config.email.port,
        auth: config.email.auth, //auth { user: 'xxx@qq.com', pass: '密码' }
      },
      attachment: {
        enable: true,
        filename: 'latest.log',
        message: 'See the attachment for the latest logs'
      },
      sendInterval: 3600*1,
      recipients: config.email.recipients, //接收邮件的邮箱
    },
  },

  categories: {
    //email 方便得知项目bug
    default: { appenders: ['stdout', 'request', 'email'], level: 'error' },
    //default 当你使用log4js.getLogger(level)，level不传，默认使用default
    error: { appenders: ['stdout', 'error', 'email'], level: 'error' },
    email: { appenders: ['email', 'stdout'], level: 'error' },
    other: { appenders: ['other'], level: 'all' },
  },
});

let log = log4js.getLogger('routes::OpcUaBridge::alert')
let track = log4js.getLogger('other')

log.debug('debug Project')
log.info('info Project')
log.warn('warn Project')
log.error('error Project')
log.fatal('fatal Project')
log.mark('mark Project')

/*
Outlook.com 的POP、IMAP 和 SMTP 设置
如果想将 Outlook.com 帐户添加到支持 POP 或 IMAP 的另一电子邮件程序，将需要进行以下手动服务器设置。

注意: 

传入和传出服务器的详细信息都相同。

POP 访问是被默认禁用的。 若要启用 POP 访问，请参阅在 Outlook.com 中启用 POP 访问。

Outlook.com SPA 帐户不需要安全密码 (身份验证) 。

IMAP 服务器名称 outlook.office365.com

IMAP 端口 993

IMAP 加密方法 TLS

POP 服务器名称 outlook.office365.com

POP 端口 995

POP 加密方法 TLS

SMTP 服务器名称 smtp-mail.outlook.com

SMTP 端口 587

SMTP 加密方法 STARTTLS
*/