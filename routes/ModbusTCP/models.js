'use strict'
let fs = require('fs')
let path = require('path')

function typeObj(obj){
  var str=Object.prototype.toString.call(obj);
  // console.log(str)
  if(str=='[object Array]'){
    return 'Array';
  }else if(str=='[object Object]'){
    return 'Object';
  }else{
    return typeof(obj)///"Primitive"
  }
}

let globalArray = []

function flat(prefix, jsonObj){

  for (var val in jsonObj) {

    if(typeObj(jsonObj[val]).indexOf('Array') >=0 ){
      console.log(typeObj(jsonObj[val]), '=typeObj()')///?
      for (let i = 0, l = jsonObj[val].length; i < l; i++) {        
        let sample = jsonObj[val][i]
        flat(prefix + val + '_' + i, sample)
      }
    } else if(typeObj(jsonObj[val]).indexOf('Object') >=0 ){  
      for (var zoom in jsonObj[val]) {
        flat(prefix + val, jsonObj[val][zoom])
      }
    } else {
      globalArray.push(prefix + typeObj(jsonObj[val]) + '-' + val + '=' + jsonObj[val])
    }
  }
}

function list(folder, extname = '.json', wildchars = "model") {
  let absolutePath = path.join(__dirname, folder)
  console.log('__dirname', __dirname)

  var files = fs.readdirSync(absolutePath, {encoding: 'utf-8'})

  let filepathList = []
  for(var i=0; i<files.length; i++) {
    let filepath1 = path.join(absolutePath, files[i])
    var fileStat = fs.statSync(filepath1)
    if(fileStat.isDirectory()) {
      ;
    } else {
      if (path.extname(filepath1) === extname) {

        var reg = new RegExp(wildchars, "gi") ///*model*/gi ////**/
        var match = reg.exec(files[i])
        if(null !== match) {
          const fp = path.join(absolutePath, files[i])
          filepathList.push(fp)
          console.log(fp)
        }
      }
    }
  }

  return filepathList  
}
let loading = list('/bootstrap', '.json', "model")
console.log(loading)

for(let k = 0; k < loading.length; k ++){
  let fn = loading[k]
  let obj = JSON.parse(fs.readFileSync(fn, 'utf-8'))
  flat('+', obj)  
}

for(let k = 0; k < globalArray.length; k ++){
  let temp = globalArray[k]
  console.log(temp)
}

module.exports = {
  flat,
  list,
}