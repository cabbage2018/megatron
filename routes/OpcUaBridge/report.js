'use strict'
let nodemailer  = require('nodemailer')
let path = require('path')
let fs = require('fs')
let mailoptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), './config/mailoptions.json')))

module.exports = {
  postman: function postman(mailContent){
    let transport = nodemailer.createTransport({
      host: mailoptions.email.host,
      // secure: true,
      secureConnection: false,
      port: mailoptions.email.port,
      auth: mailoptions.email.auth
    })
    
    var options = {
      from          : mailoptions.email.from,
      to            : mailoptions.email.to,
      cc            : mailoptions.email.cc, 
      bcc           : mailoptions.email.bcc, 
      subject       : mailoptions.email.subject,
      text          : mailContent,
      // html           : '<h1> "host": "smtp.126.com", 这是一封 Market-specific Solutions！</h1><p>  Market-specific Solutions a trusted advisor and reliable partner, as a system integrator, service provider and a product vendor,  without 附件版本</p>',
      contentType   : "text/plain;charset=utf-8",
      attachments : 
      [
          // {
          //     filename: 'errors.trp', 
          //     path: path.join(process.cwd(), './logs/errors.trp'),
          //     cid : '00000001'
          // },
          {
              filename: 'mailoptions.json',   
              path: path.join(process.cwd(), './config/mailoptions.json'),
              cid : '00000002'
          },
      ]                
    }
    transport.sendMail(options, function(err, response){
      transport.close()    
      if(err){
        console.log(err)
        // reject(err)
      } else {
        console.log(response)
        // resolve(response)
      }
    })
    // let futuresPromise = new Promise(async function (resolve, reject) {
    // })
    // return futuresPromise
  }   
 }
