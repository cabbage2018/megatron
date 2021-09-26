let fs = require('fs')
let path = require('path')

function flat(jsonObj){
  for (var val in jsonObj) {
    alert(val + " " + myJson[val]);//输出如:name 
}
}

function load(){
  accumulatedSpace = require("./bootstrap/scan_config")/**/
  sleep(6000)
  .then( async ()=>{
      log.debug("------>>>")
      for(var j = 0; j < accumulatedSpace.physicalAddress.registerGrid.length; j ++){
          let grid = accumulatedSpace.physicalAddress.registerGrid[j]
          accumulatedSpace.physicalAddress.start = grid.start
          accumulatedSpace.physicalAddress.count = grid.count

          await modbustcp.acquire(accumulatedSpace)
          .then((_response)=>{
              console.log(_response)
              processResponse(_response)
          })
          .catch((error)=>{
              console.log(("Fatals: " , __dirname, __filename, error))
          })
      }
      log.debug("<<<------")
  })
  .catch((error)=>{
      log.debug(`error@ := ${__filename}`, error)
  })
}

function list(folder, extname = '.json') {
  console.log('__dirname', __dirname)
  let absolutePath = path.join(__dirname, folder)
  var files = fs.readdirSync(absolutePath, {encoding: 'utf-8'})

  let filepathList = []

  for(var i=0; i<files.length; i++) {
    let filepath1 = path.join(absolutePath, files[i])
    var fileStat = fs.statSync(filepath1)
    if(fileStat.isDirectory()) {
      ;
    } else {
      if (path.extname(filepath1) === extname) {

      //   var reg = new RegExp('address*', 'gi')
      //   var match = reg.exec(files[i])
      //   if(null !== match) {
      //     const fullfilepath = path.join(folder, files[i])
      //     let p = path.join(__dirname, fullfilepath)
      //     pathList.push(p)
      //   }

      let fp = path.join(absolutePath, files[i])
      console.log(fp)

      filepathList.push(fp)
      }
    }
  }

  return filepathList  
}
let currentFilepath = list('/bootstrap')
console.log(currentFilepath)

module.exports = {
  load,
  list,
}