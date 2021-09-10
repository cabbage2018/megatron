let fs = require('fs')
let path = require('path')
let wrapper = require('../model/wrapper')

module.exports = {

  iterateAddress: function iterateAddress(){

    let absoluteDir = path.join(__dirname, './bootstrap')
    let pack = wrapper.list(absoluteDir, '.json', "address")
    console.log(pack)
    
    let dict = new Map()
    for(let k = 0; k < pack.length; k ++){
      let fn = pack[k]
      let obj = JSON.parse(fs.readFileSync(fn, 'utf-8'))
      wrapper.flat('+', obj)
      
      for(let l = 0; l < obj.array.length; l ++){
        let remote = obj.array[l]
        dict.set(`${remote.ip}#${remote.port}#${remote.subordinatorNumber}#${remote.model}#`, remote)
      }
    }
    
    let refinedArray = []
    for(var item of dict){
      refinedArray.push(item[1])
    }

    for(let k = 0; k < refinedArray.length; k ++){
      let temp = refinedArray[k]
      console.log(temp)
    }
    
    console.log(refinedArray.length, 'descrete device found')

    return refinedArray;
  }
}
