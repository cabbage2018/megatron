'use strict'
let log4js = require('log4js')

let log = log4js.getLogger('routes::OpcUaBridge::alert')
let track = log4js.getLogger('other')

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