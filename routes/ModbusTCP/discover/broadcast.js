'use strict'
let fs = require("fs")
let log4js = require('log4js')
let log = log4js.getLogger('routes::modbustcp::discover')

let listener = require('./listener')  ///listen on another port before sending

var dgram = require("dgram")
var talker = dgram.createSocket("udp4")
let port = 17009

let remoteDictionary = listener.remotes

talker.on("error", function (err) {
  log.error(err)
  talker.close()
})

talker.on("message", function (msg, remote) {
  if(msg){
    log.error(msg.toString())
    remoteDictionary.set(remote, msg.toString('ascii'))  
    log.fatal(`port: ${port}, `, remote, msg)  
  }
})

talker.on("listening", function () {
  log.info(`listening: ${address}, `, address.address, address.port)
  var address = talker.address()
})

talker.bind(port)

setTimeout(function() {
    talker.setBroadcast(true)
    let message = Buffer.from([0x31, 0x1, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]) // magic is here
    
    let result = talker.send(message, 0, message.length, 17008, "255.255.255.255", (error, bytes)=>{
      if(!error){
        log.warn(`msg:${bytes.toString()} bytes:${bytes} port:${port}`)
      } else {        
        log.error(`error:${error} bytes:${bytes} port:${port}`)
      }
    })

  }, 1000 * 5)

/*async*/ function wrap(dictonary, filepathname) {
	let ruleString = `<html><body><table>`
  ruleString += `<tr><th>index</th><th>address</th><th>identification response</th></tr>`
  let count = 0

	for (let y of dictonary) {
    count ++
    let escaped = unescape(JSON.stringify(y[1]))
    // log.debug(escaped)
    log.error(y[1].toString('utf16le'))
		ruleString += `<tr><td>${count}</td> <td>${JSON.stringify(y[0])}</td> <td> ${y[1].toString('utf16le')}-- ${JSON.stringify(y[1])}</td></tr>`
  }

	ruleString += `</table></body></html>`	
	// let candidateArray = (__dirname).split("\\")//'/'
	// let filename = candidateArray[candidateArray.length - 1]	// index = length - 1
	// let filepath = './public/' + filename + '.html'
	fs.writeFileSync(filepathname, ruleString)
}

setTimeout(function() {
  log.debug(remoteDictionary.size + ' remote device found till now, check output html 5 for detail information')
  wrap(remoteDictionary, './public/discover-3000.html')
  }, 1000 * 15
)

