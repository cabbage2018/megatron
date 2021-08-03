'use strict'
let log4js = require('log4js')
let log = log4js.getLogger('routes::report')
let nodemailer  = require('nodemailer')
let mailoptions = require('../../config/mailoptions.json')

log.debug('debug Project')
log.info('info Project')
log.warn('warn Project')
log.error('error Project')
log.fatal('fatal Project')
log.mark('mark Project')

function postman(jsonObject){
  let textString = JSON.stringify(jsonObject) + "@" + __filename
  let transport = nodemailer.createTransport(/*'SMTP', */{
    host : 'smtp.126.com',
    //secure: true, // 使用 SSL
    secureConnection: true, // 使用 SSL
    port: 25, // 网易的SMTP端口，各个服务商端口号不同，比如qq的是465
    //sendmail: true,
    //newline: 'windows',
    auth : mailoptions.email.auth,
  });

  var options = {
    from          : mailoptions.email.from,
    to            : mailoptions.email.to,
    cc            : mailoptions.email.cc,  //抄送
    bcc           : mailoptions.email.bcc,    //密送
    subject       : mailoptions.email.subject,
    text          : textString,
    // html           : '<h1> "host": "smtp.126.com", 这是一封 Market-specific Solutions！</h1><p>  Market-specific Solutions a trusted advisor and reliable partner, as a system integrator, service provider and a product vendor,  without 附件版本</p>',
    contentType   : "text/plain;charset=utf-8",
  /*
    attachments : 
        [
            {
                filename: 'img1.png',            // 改成你的附件名
                path: 'public/mail/img1.png',  // 改成你的附件路径
                cid : '00000001'                 // cid可被邮件使用
            },
            {
                filename: 'img2.png',            // 改成你的附件名
                path: 'public/mail/img2.png',  // 改成你的附件路径
                cid : '00000002'                 // cid可被邮件使用
            },
        ]*/                    
  };

  transport.sendMail(options, function(err, response){
    if(err){
      log.error(err)
    } else {
      // log.info(response)
    }
    transport.close(); // 如果没用，关闭连接池
  })
}

module.exports = {
 postman: postman 
}