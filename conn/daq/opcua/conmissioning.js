'use strict'
let path = require('path')
let fs = require('fs')
// const log4js = require('log4js')
// const log = log4js.getLogger('conn::daq::opcua:configure')

module.exports = {
  // commision: function commissioning() {
  // },

  physical: function () {
    let fullpath1 = path.join(__dirname, './remote.json')
    let jsonObj = JSON.parse(fs.readFileSync(fullpath1))
    console.log(`${jsonObj.array.size} models found under ${__dirname}`)
    return jsonObj
  },

  space: function () {
    let typeMap = listType(__dirname)
    let premiseMap = new Map()
    for (var x of typeMap) {
      log.trace(`${x[0]}->${x[1]}`)

      var files1 = fs.readdirSync(x[1], { encoding: 'utf-8' })
      for (var i = 0; i < files1.length; i++) {
        var reg = new RegExp(/space/gi)
        var match = reg.exec(files1[i])
        if (match) {
          let fullpath = path.join(x[1], files1[i])
          if (fs.existsSync(fullpath)) {
            let jsonObj = JSON.parse(fs.readFileSync(fullpath))
            premiseMap.set(x[0], jsonObj)
          }
          console.log(`${files2[j]} space json for ${path2}`)
          break;
        }
      }
    }
    console.log(`${premiseMap.size} models found under ${__dirname}`)
    return premiseMap
  },

  layout: function () {
    let typeMap = listType(__dirname)
    let premiseMap = new Map()
    for (var x of typeMap) {
      log.trace(`${x[0]}->${x[1]}`)

      var files1 = fs.readdirSync(x[1], { encoding: 'utf-8' })
      for (var i = 0; i < files1.length; i++) {
        var reg = new RegExp(/layout/gi)
        var match = reg.exec(files1[i])
        if (match) {
          let fullpath = path.join(x[1], files1[i])
          if (fs.existsSync(fullpath)) {
            let jsonObj = JSON.parse(fs.readFileSync(fullpath))
            premiseMap.set(x[0], jsonObj)
          }
          console.log(`${files2[j]} space json for ${path2}`)
          break;
        }
      }
    }
    console.log(`${premiseMap.size} models found under ${__dirname}`)
    return premiseMap
  },
  
  response: function () {
    let typeMap = listType(__dirname)
    let premiseMap = new Map()
    for (var x of typeMap) {
      log.trace(`${x[0]}->${x[1]}`)

      var files1 = fs.readdirSync(x[1], { encoding: 'utf-8' })
      for (var i = 0; i < files1.length; i++) {
        var reg = new RegExp(/response/gi)
        var match = reg.exec(files1[i])
        if (match) {
          let fullpath = path.join(x[1], files1[i])
          if (fs.existsSync(fullpath)) {
            let jsonObj = JSON.parse(fs.readFileSync(fullpath))
            premiseMap.set(x[0], jsonObj)
          }
          console.log(`${files2[j]} space json for ${path2}`)
          break;
        }
      }
    }
    console.log(`${premiseMap.size} models found under ${__dirname}`)
    return premiseMap
  },
}
