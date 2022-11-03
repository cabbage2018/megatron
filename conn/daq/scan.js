'use strict'
let modbustcp = require('modbustcp')
let opcua = require('opcua')
let snap7 = require('snap7')
let startAt = new Date()
let protocolMap = new Map()//[]
orchestrate(array, holder, (responses)=>{console.log(responses)})
module.exports = {
	startAt: startAt,
	handle: function(){
		modbustcp.orchestrate()
		opcua.orchestrate()
		snap7.orchestrate()

		protocolMap.set('MODBUSTCP', modbustcp.models)
		protocolMap.set('OPCUA', opcua.models)
		protocolMap.set('SNAP7', snap7.models)

	},
  
	protocols: protocolMap,
}
function scan() {
  if (fs.existsSync(path.join(process.cwd(), './logs/errors.trp'))) {
    let alarmString = fs.readFileSync(path.join(process.cwd(), './logs/errors.trp'))
    email.error(`${new Date().toISOString()} :\r\n\r\n ${alarmString} and;\r\n then this source is deleted.`)
    fs.unlinkSync(path.join(process.cwd(), './logs/errors.trp'))
    log.warn('deleting: ', path.join(process.cwd(), './logs/errors.trp'))
  } else {
    log.debug('what a nice day.')
  }
}
function displayProperties(jsonObj) {
  for (var val in jsonObj) {
    log.warn(val + ": " + myJson[val]);//输出如:name 
  }
}
//   var reg = new RegExp('address*', 'gi')
//   var match = reg.exec(files[i])
//   if(null !== match) {
//     const fullfilepath = path.join(folder, files[i])
//     let p = path.join(__dirname, fullfilepath)
//     pathList.push(p)
//   }

// function list(folder, extname = '.json', wildchars = "model") {
//   let absolutePath = folder///path.join(__dirname, folder)
//   var files = fs.readdirSync(absolutePath, { encoding: 'utf-8' })
//   let filepathList = []
//   for (var i = 0; i < files.length; i++) {
//     let filepath1 = path.join(absolutePath, files[i])
//     var fileStat = fs.statSync(filepath1)
//     if (fileStat.isDirectory()) {
//       ;
//     } else {
//       if (path.extname(filepath1) === extname) {
//         var reg = new RegExp(wildchars, "gi") ///*model*/gi ////**/
//         var match = reg.exec(files[i])
//         if (null !== match) {
//           const fp = path.join(absolutePath, files[i])
//           filepathList.push(fp)
//           // console.log(fp)
//         }
//       }
//     }
//   }
//   return filepathList
// }