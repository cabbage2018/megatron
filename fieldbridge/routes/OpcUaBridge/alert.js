'use strict'
let log4js = require('log4js')

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

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
function email(jsonObject) {

  let messageString = JSON.stringify(jsonObject)

  // 开启一个 SMTP 连接池
  var transport = nodemailer.createTransport( 
    smtpTransport( {
      host: config.email.host, // 主机，各服务商的主机地址不同，比如qq的是smtp.qq.com
      secure: true, // 使用 SSL
      secureConnection: true, // 使用 SSL
      port: config.email.port, // 网易的SMTP端口，各个服务商端口号不同，比如qq的是465
      auth: config.email.auth
    }
  ));

// 设置邮件内容
var mailOptions = {
  from: config.email.from, // 发件人地址
  to: config.email.recipients, // 收件人列表,逗号分隔，可以放多个
  subject: config.email.sender, // 标题
  html: messageString // html 内容
}
  
// 发送邮件
  transport.sendMail(mailOptions, function(error, response){
    if(error){
      log.debug(error);
    }else{
      log.info("Message send ok");
    }

    transport.close(); // 如果没用，关闭连接池
    log.warn(response)
  });
}

module.exports = {
  email: email
}