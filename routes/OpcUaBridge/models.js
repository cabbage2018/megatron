'use strict'
let fs = require('fs')
let path = require('path')

function list(folder, extname = '.json', wildchars = '*model*') {
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

        var reg = new RegExp(wildchars, 'gi')
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
let loading = list('/bootstrap', '.json', '*model*')
console.log(loading)

module.exports = {
  list,
}