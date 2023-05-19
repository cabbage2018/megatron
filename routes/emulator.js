'use strict'
let modbus = require('jsmodbus')// Master or initiator
let net = require('net')
const log4js = require('log4js')
// const tracer = log4js.getLogger('daq:modbus')
let log4js = require('log4js')
let tracer = log4js.getLogger('routes::schedule')
let fs = require('fs')
let cron = require('node-cron')
class MyPromise extends Promise {
	constructor(ms, callback) {
		// We need to support being called with no milliseconds
		// value, because the various Promise methods (`then` and
		// such) correctly call the subclass constructor when
		// building the new promises they return.
		// This code to do it is ugly, could use some love, but it
		// gives you the idea.
		let haveTimeout = typeof ms === "number" && typeof callback === "function";
		let init = haveTimeout ? callback : ms;
		super((resolve, reject) => {
			init(resolve, reject);
			if (haveTimeout) {
				setTimeout(() => {
					reject("Timed out");
				}, ms);
			}
		});
	}
}

let measureJobs = null;
let tariffJobs = null;
let realtimeActions = null;

// 2.1 precisely hourly job, based on correct local time and timezone.[tbd]
let quarterlyTask = cron.schedule('0 */15 */1 * * *', () => {
	let currentTime = new Date();
	let hour = currentTime.getHours();
	console.log(hour);
	const maxConsumption = 567890;
	const minConsumption = 123456;
	let tariffActiveImport = 234567;
	tariffActiveImport += parseInt(Math.random() * (maxConsumption - minConsumption + 1) + minConsumption, 10);
	console.log(`quarterly energy consumption: ${tariffActiveImport} -kWh`);
})
quarterlyTask.start();
quarterlyTask.stop();
quarterlyTask = cron.schedule('0 0 */1 * * *', () => {
	// cb();
})
quarterlyTask.start();
const cyclicIntervalSeconds = 15;
let issueTask = setInterval(() => {
}, cyclicIntervalSeconds * 1000)

if (plentyOfTasks.length > 500) {
	throw new Error('error!!! critical resource threshold hit~')
}

function clearAllJobs() {
	while (plentyOfTasks && plentyOfTasks.length > 0) {
		var t = plentyOfTasks.pop()
		///clearTimeout(h)
		// clearInterval(t)
		t = null
	}
}


// // 5 RESTful APIs
// router.get('/', (req, res) => {

//   var obj = profilingDictionary
//     res.render('dictionary', {
//         title: __filename + new Date().toISOString(),
//         items: obj
//   })
// })

// router.get('/list', (req, res) => {

//   const scheduledTasks = plentyOfTasks
// 	// schedule one task at once
//   res.render('list', {
//     title: __filename + new Date().toISOString(),
//     items: scheduledTasks
//   })
// })

// router.get('/stopall', (req, res) => {
	
//   utility.sleep(3000)
//   .then(()=>{
//     clearAllJobs()
//     const scheduledTasks = plentyOfTasks
//     res.render('list', {
//       title: __filename + new Date().toISOString(),
//       items: scheduledTasks
//     })
//   })
//   .catch((error)=>{
//     res.render('error', {
//       message: __filename + new Date().toISOString(),
//       error: error
//     })
//   })
// })
