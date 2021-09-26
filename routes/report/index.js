'use strict'
let nodemailer  = require('nodemailer')
let path = require('path')
let fs = require('fs')
let mailoptions = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config/mailoptions.json')))
console.log(`__dirname: ${__dirname}`)
module.exports = {
  postman: function postman(mailContent){
    let promise1 = new Promise(async function (resolve, reject) {
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
            {
                filename: 'mqttoptions.json', 
                path: path.join(__dirname/*process.cwd()*/, '../../config/mqttoptions.json'),
                cid : '00000001'
            },
            {
                filename: 'opcuaspaces.json',   
                path: path.join(__dirname/*process.cwd()*/, '../../config/opcuaspaces.json'),
                cid : '00000002'
            },
        ]                
      }    
      transport.sendMail(options, function(err, response){
        transport.close()
        if(err){
          reject(err)
        } else {
          resolve(response)
        }
      })
    })

    return promise1
  }   
 }