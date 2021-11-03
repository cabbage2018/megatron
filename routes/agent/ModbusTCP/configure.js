'use strict'
let fs = require('fs')
let log4js = require('log4js')
let log = log4js.getLogger('routes:ModbusTCP:configure')
let inventory = require('./inventory')
let benchmark = require('./benchmark')
let scheduler = require('./scheduler')

/*
  2 tiered directory under ../config/
*/
function listFolderFiles(folder, ext = '.json', regexp = 'model*') {

  let candidate = new Map()
  // characters encoding
  var dirs = fs.readdirSync(folder, {encoding: 'utf-8'})
  for(var i=0; i<dirs.length; i++) {
    let fullpath1 = path.join(folder, dirs[i])
    let path2 = dirs[i]
    var folderStat = fs.statSync(path1)
    console.log(path1, path2, folderStat)

    if(folderStat.isDirectory()) {
      let modelDic = new Map()

      let newStart= folderStat.filename;
      let files2 = fs.readdirSync(newStart, {encoding: 'utf-8'})
      for(var j=0; j<files2.length; j++) {
        let fullpath2 = path.join(newStart, files2[j])

        let filesStat = fs.statSync(fullpath2)
        if (path.extname(fileStat) === '.json') {
          var filter = new RegExp('*model*' || '*address*' || '*spaces*', 'gi')
          var match = filter.exec(files[j])
          if(match) {
            let p = path.join(process.cwd(), fullfilepath)
            console.log(p)
            modelDic.set(files[j], fullpath)
          }
        }//each json file  
      }

      candidate.set(folderName, modelDic)
    }// each sub folder
  }
  return candidate
}
let startpoint = path.join(process.cwd(), '/config/*')
log.debug(listFolderFiles(startpoint))

/*
    OBSERVE ../config/ folder for dynamic input
    currently only file is supported

*/
// Serialize, deserialize
function serialize(dictionary, filepath) {
	let array = Array.from(dictionary.entries())
	let str = JSON.stringify(array)
	let result = fs.writeFileSync(filepath, str, 'utf-8')
	return array.length
}

let recovery = './public/snapshot.json'
let historyDictionary = deserialize(recovery);

fs.watch(monitorRoot, function (event, filename) {
    if (event === "change") {
        if (filename) {
          if(profileDictionary.get(filename) === null) {
                let fullpath = path.join(monitorRoot, filename)
                try {
                    log.debug(path.join(monitorRoot, filename))

                    let rawJsonObject = JSON.parse(fs.readFileSync(fullpath), 'utf-8')
                    for(let i = 0; i < handlerArray.length; i = i + 1) {
                        let handler = handlerArray[i]
                        premier.compile(datapoints)
                    }
                    
                } catch (error) {
                    throw new Error('Wrong operation in fs.watch(...)')
                }
                profileDictionary.set(filename, new Date())
                ///delete
                setTimeout(function() {
                        if (fs.existsSync(fullpath)) {
                            fs.unlinkSync(fullpath)
                            log.debug('定时/删除', filename, 'from profileDictionary')
                        }
                    }, 30
                )
            } else {
                /// filename had been processed before
                //   profileDictionary.delete(filename)
                log.debug(`profileDictionary.size = ${profileDictionary.size}`)
                delete profileDictionary[filename]
                log.debug(`profileDictionary.size = ${profileDictionary.size}`)            
            } 
        }
    }
    return
});

// static page
(()=>{
    for (let entry of profileDictionary.entries()) {
        let key = entry[0],
        value = entry[1]
        log.debug(`${key}: ${value}`)
    }
    log.debug(`profileDictionary.size = ${profileDictionary.size}`)
    return
})()


function bootsup(location){
    let projets = listfile(location, '.json', '*assets*')
    let models = listfile(location, '.json', '*model*')
    let results = scan(projets, models) // Cartesian cross X
}

Date.prototype.format = function (format) {
    var o = {
      "M+": this.getMonth() + 1, //month
      "d+": this.getDate(), //day
      "h+": this.getHours(), //hour
      "m+": this.getMinutes(), //minute
      "s+": this.getSeconds(), //second
      "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
      "S": this.getMilliseconds() //millisecond
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length == 1 ? o[k] :
          ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}  
/*
    self boots

*/
count = 3;
let counterDownOnce = setInterval(function () {
    let output = new Date().format('hh-mm:ss') + ': ' + count
    process.stdout.write(output + '\r')
    count --
    if (count === 0) {
        clearInterval(counterDownOnce)
        bootsup(startpoint)
    }
  }, 1000)
  
module.exports.status = _status
