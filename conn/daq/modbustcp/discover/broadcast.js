'use strict'
let fs = require("fs")
let log4js = require('log4js')
let log = log4js.getLogger('routes::modbustcp::discover')
let dgram = require("dgram")
let talker = dgram.createSocket("udp4")
let port = 17009
let modbustcp = require("../modbus")

let onlineIps = new Map()

// MODBUS 
setTimeout(async function () {
	const startMoment = new Date().getTime()
	let refip = "192.168.2"
	for (var j = 1; j < 255; j++) {
		await sleep(6000)
			.then(async () => {
				let ipstr = refip + "." + j;
				await modbustcp.acquire(ipstr)
					.then((_response) => {
						onlineIps.set(ipstr, new Date())
					})
					.catch((error) => {
						log.fatal(ipstr, error)
					})
			})
			.catch((error) => {
				log.fatal(ipstr, error)
			})
	}
	const endMoment = new Date().getTime()
	log.warn("Profiling broadcast: ", endMoment - startMoment, " millisecond")
}, 9000)

// UDP
talker.on("error", function (err) {
	log.error(err)
	talker.close()
})

talker.on("message", function (msg, remote) {
	if (msg) {
		log.debug(msg.toString(), `port: ${port}, `, remote, msg)
	}
})

talker.on("listening", function () {
	log.info(`listening: ${address}, `, address.address, address.port)
	var address = talker.address()
})

talker.bind(port)

setTimeout(function () {
	talker.setBroadcast(true)
	let message = Buffer.from([0x31, 0x1, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]) // magic is here
	let result = talker.send(message, 0, message.length, 17008, "255.255.255.255", (error, bytes) => {
		if (!error) {
			log.mark(`msg:${bytes.toString()} bytes:${bytes} port:${port}`)
		} else {
			log.error(`error:${error}`)
		}
	})
}, 1000 * 25)

// list2html
function list2html(array) {
	let ruleString = `<html><body><table>`
	ruleString += `<tr><th>Id</th><th>context</th></tr>`
	for (let i = 0; i < array.length; i++) {
		ruleString += `<tr><td>${i}</td> <td>${JSON.stringify(array)}</td> </tr>`
	}
	ruleString += `</table></body></html>`
	let filename = ''
	let candidateArray = (__dirname).split("\\")//.split("/")///wINDOWS only
	for (let k = 0; k < candidateArray.length; k = k + 1) {
		filename = candidateArray[k]
	}
	let filepath = './public/' + filename + '.html'
	console.log(filepath)
}

function dic2html(dictionary) {
	let ruleString = `<html><body><table>`
	ruleString += `<tr><th>index</th><th>address</th><th>identification response</th></tr>`
	let count = 0
	for (let y of dictionary) {
		count++
		let escaped = unescape(JSON.stringify(y[1]))
		log.error(y[1].toString('utf16le'))
		ruleString += `<tr><td>${count}</td> <td>${JSON.stringify(y[0])}</td> <td> ${y[1].toString('utf16le')}-- ${JSON.stringify(y[1])}</td></tr>`
	}
	ruleString += `</table></body></html>`
}

function savedic(dic) {
	let str = dic2html(dic);
	let fullpath = path.join(process.cwd(), './logs/modbus_tcp_broadcast_' + new Date().toISOString().replace(/[\,.:;/]/gi, "_") + '.html');
	savefile(str, fullpath);
}
function savelist(array) {
	let str = list2html(dic);
	let fullpath = path.join(process.cwd(), './logs/modbus_tcp_broadcast_' + new Date().toISOString().replace(/[\,.:;/]/gi, "_") + '.html');
	savefile(str, fullpath);
}

// dataset2html
function present(dictionary) {
	let s = `<html><body><table>`
	s += `<tr><th>index</th><th>key</th><th>value</th></tr>`
	let index = 0
	for (let i of dictionary) {
		let key = i[0]
		let value = i[1]
		s += `<tr><td>${index}</td> <td>${JSON.stringify(key)}</td> <td>${JSON.stringify(value)}</td> </tr>`
		index++
	}
	s += `</table></body></html>`
	return s;
}

sleep(900000)
	.then(() => {
		log.mark(onlineIps.size())
		for (let entry in onlineIps) {
			log.mark(entry[0], entry[1])
		}
		let s = present(onlineIps);
		let filename = './' + (new Date().toISOString()).replace(/[:./\\ ]/gi, "-") + '.html'
		// fs.writeFileSync(filename, s)
		fs.writeFileSync(filename, s);

		let fullpath = path.join(pwd(), './public/discover-3000.html')
		let str = dic2html(onlineIps)
		// let candidateArray = (__dirname).split("\\")//'/'
		// let filename = candidateArray[candidateArray.length - 1]	// index = length - 1
		// let filepath = './public/' + filename + '.html'
	})
