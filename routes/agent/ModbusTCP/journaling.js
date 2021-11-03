'use strict'
let fs = require('fs')
let path = require('path')
let profilingDictionary = new Map()//assets' inventory!
let historyDataArray = []
// let deviceLibrary = new Map()
function refresh (){
  // historyDataArray = arrayize(profilingDictionary)
  // customize2Html(historyDataArray)
  report()
  return profilingDictionary.clear();
}

/*
  qualified decode information includes

    fc. : function code
    type: DOUBLE/INT32/LONG64/STRING/TIMESTAMP/BITS/FLOAT32/CUSTOM/ENUM[{0: SUCCESS},{1:FAIL}]
    reg_start: 1-65535
    reg_count: 1-127
    bit_offset: 0-64
    bit_count: 0-64
    description: STRING//naming from docu
    unit: TEXT//high important when dealing with semantic latex


    unique_index: number//not important, optional, for statistics

    val: indicated by type^^^, could be a unreasonable null
    timestamp: STRING
    quality: number

*/

function decode(focus, segment){

  // deep clone method 
  let obj = JSON.parse(JSON.stringify(segment))

  switch (obj.type.toUpperCase()) {

    case "FLOAT":
      obj['val'] = focus.readFloatBE(0);
    break;

    case "DOUBLE":
      obj['val'] = focus.readDoubleBE(0);
    break;

    case "INT":
      obj['val'] = focus.readInt32BE(0);
    break;

    case "LONG": 
      obj['val'] = focus.readInt64BE(0);
    break;  
    
    case "BOOLEAN":
      console.log(obj.fc, obj.bit_count)
      // process as BITS but sometime DI, sometime bit from a register
      // to be verified with hardware!?
    case "BITS":

      let bitoffset = obj.bit_offset
      let bitcount = obj.bit_count
      let intval = 0

      let longval = obj.reg_count === 1? focus.readInt16BE(0):
            obj.reg_count === 2? focus.readInt32BE(0):
            obj.reg_count === 3? focus.readInt64BE(0):
            obj.reg_count === 4? focus.readInt64BE(0):focus.readUInt16BE(0);
      
            
      let mask = 0
      for (let o = bitoffset; o < bitoffset + bitcount; o = o + 1) {
        mask = mask + (0x1 << o)
      }

      obj['val'] = (longval & mask) >> obj.bit_offset
          
      break;

    case "TIMESTAMP":
      obj['val']  = focus.toString('ascii', 0, focus.length)
    break;
    
    case "STRING": 
      obj['val']  = focus.toString('ascii', 0, focus.length)
    break;

    case "HEXSTRING":
      obj['val']  = focus.toString('hex', 0, focus.length)
    break;

    default:
      obj['val']  = focus.toString('hex', 0, focus.length)

      console.log('Wrong data type!' + obj.type)
    break;
  }

  return obj;
}

function list2map(list){
  let map = new Map()
  for(let i = 0; i < list.length; i = i + 1){
    map.set(list[i].reg_start, list[i])
  }
}

function mapping(modelName, space, responses, modelJson){  
  let decoder1 = list2map(modelJson)

  let raw_start = Number(responses.request._body._start)
  let raw_count = Number(responses.request._body._count)
  let buffer = Buffer.from(responses.response._body._valuesAsBuffer)
  
  let decodedArray = []
  for(let reg = raw_start; reg < raw_count + raw_count; reg ++){
    if(decoder1.get(reg)/*undefined*/){
      let seg = decoder1.get(reg)
      // boundary check!
      if(set.reg_start + seg.reg_count <= raw_start + raw_count){
        
        // 创建一个长度为 10、且用 0 填充的 Buffer。
        const buf1 = Buffer.alloc(seg.reg_count * 2);
        let focus = buffer.copy(buf1, 0, (seg.reg_start - raw_start)*2, (seg.reg_start - raw_start + seg.reg_count)*2)//fill in 16bit reg buffer = 0xff 8bit raw stream array
        let obj = decode(focus, seg)
        obj.buf = focus
        // obj.quality = responses._body.qualityCode
        // obj.timestamp = responses.metrics.receivedAt
        // let deviceIndicator = modelName /*space.protocol*/ + '://' + space.ip + ':' + space.port + '/' + space.subordinator
        
        // if(decodedDictionary.get(deviceIndicator)){

        //   let list3 = decodedDictionary.get(deviceIndicator)
        //   list3.push(obj)
        // } else{

        //   decodedDictionary.set(deviceIndicator, [obj])
        // }

        decodedArray.push(obj)//keep decode order
      }
    }
  }
  responses.decoded = decodedArray
}

function rebuild(space, responses, models){
  let str2 = space.protocol
  let splitArr = str2.split('.')
  let designated = splitArr[splitArr.length -1]//last train

  for(let i = 0; i < models.length; i = i + 1){
    let modelPathName = models[i]
    let arr = modelPathName.split("\\")//'/' !!! depends on OS 
    let modelName = arr[arr.length - 1]
    if(modelName.toLowerCase().indexOf(designated.toLowerCase()) >= 0){
      let modelJson =JSON.parse(fs.readFileSync(modelPathName, 'utf-8'))
      mapping(modelName, space, responses, modelJson)
    }
  }
}

/*
  map: space -> [] response JSON Obj
    response JSON Ojb : raw infor from MODBUS protocol stack
                      : [] decoded entries
                 
  realize in ejs later on

*/
function profile(){
  let result = ''
  for (var x of profilingDictionary) {
    let spaceObj = x[0]
    log.mark(spaceObj)
    result += `${spaceObj.protocol}://`+`${spaceObj.ip}:`+`${spaceObj.port}/`+`${spaceObj.subordinator}/`
    let responsesArray = x[1]
    if(responsesArray.length > 0){
      let response = responsesArray.pop()
      result += `${response.response.response._body._valuesAsBuffer}::`
      result += `${response.metrics.receivedAt}::`
      result += `${response.response._body._start}::`
      result += `${response.response._body._count}::`
      result += `${response.response._body._fc}::`
      result += `quality=0;`
      result += `\r\n`//title line, one per URI

      let decodeArray = response.decoded
      for(let i = 0; i < decodeArray.length; i = i + 1) {
        let segment = decodeArray[i]
        log.mark(decodeArray[i])
        result += `${segment.raw_start}::${segment.raw_count}::${segment.bit_offset}::${segment.bit_count}::`
        result += `${segment.unique_index}::${segment.description}::${segment.type}::${segment.unit}::`
        result += `${segment.val};\r\n`        
      }
    }else{
      result += `::\r\n`
    }
  }
  // output result to file to get a structured view of visualization
  return result
}

function arrayize(){
  let result = []
  for (var x of profilingDictionary) {
    let spaceObj = x[0]
    log.mark(spaceObj)

    let title ={}
    title['protocol'] = spaceObj.protocol
    title['ip'] = spaceObj.ip
    title['port'] = spaceObj.port
    title['subordinator'] = spaceObj.subordinator
    let responsesArray = x[1]
    if(responsesArray.length > 0){
      let response = responsesArray.pop()
      title['_valuesAsBuffer'] = response.response.response._body._valuesAsBuffer
      title['receivedAt'] = response.metrics.receivedAt
      title['_start'] = response.response._body._start
      title['_count'] = response.response._body._count
      title['_fc'] = response.response._body._fc
      title['_quality'] = 0

      result.push(title)


      let decodeArray = response.decoded
      for(let i = 0; i < decodeArray.length; i = i + 1) {
        let sample = {}
        let segment = decodeArray[i]
        log.mark(decodeArray[i])
        sample['_raw_start'] = segment.raw_start
        sample['_raw_count'] = segment.raw_count
        sample['_bit_offset'] = segment.bit_offset
        sample['_bit_count'] = segment.bit_count
        
        sample['_index'] = segment.segment.unique_index
        sample['_description'] = segment.description
        sample['_type'] = segment.type
        sample['_unit'] = segment.segment.unit
        sample['_val'] = segment.val
        sample['-'] = '#'
        result.push(sample)
      }
    }else{
    }
  }
  // output result to file to get a structured view of visualization
  return result
}


/*
  Assume input array's fields:
    'enum'
    'val'
    'des'
    'buf'
  but this function sypport dynamic column
*/
function project2Html(arr){
  log.debug(`>> ${typeof(arr)}; length: ${arr.length}`)

  let s = ''
  for (let i = 0; i < arr.length; i ++) {
    let obj = arr[i]    
    let l = '<tr>'
    for(var key in obj){
      // log.trace(key, obj[key])
      l = l + `<td class="${key}">${obj[key]}</td>`
    }
    l = l + '</tr>'
    s = s + l
  }
  let h =  `<html><body><table>${s}</table></body></html>`
  let fns= new Date().toISOString().replace(/[:./;\/\\]/gi, "") + `.html`  /*.toLowerCase()*/
  fs.writeFileSync(path.join(process.pwd(), fns), h)
}

/*
  Read register's Array, write as binary string
*/
function binaryString(buffer){
  let strbinArr = []
  for (var offset = 0; offset < buffer.length/2; offset = offset + 1) {
    const wordBuffer = buffer.slice(2 * offset, 2 * offset + 2)
    log.info("Reg: ", offset, ": ", wordBuffer.toString('hex'))
    let wordval = wordBuffer.readUInt16BE()
    let strhex = wordBuffer.toString('hex')
    let strbin = ''
    if(typeof(wordval) === 'number'){
        const result = wordval.toString(2)
        const s = ("0000000000000000" + result)
        strbin = s.substr(-16, 16)//16 bit slice
        strbinArr.push(strbin)
    }
  }
  return strbinArr;
}

function control(){
  let tsb = `<tr>\
  <th>Asset</th>\
  <th>Ip</th>\
  <th>Port</th>\
  <th>Number</th>\
  <th>Fc</th>\
  <th>Reg</th>\
  <th>Count</th>\
  <th>Timeout</th>\
  <th>Buffer</th>\
  <th>Content</th>\
  </tr>`;

  for (let x in profilingDictionary) {
    let space = x[0]
    let resp = x[1]
    let indicator = resp.pop()
    let isConnected = JSON.stringify(indicator).search(/error/i); //JSON.stringify(indicator).toLowerCase().indexOf('error')
    let app = isConnected? `\
    <td bgcolor="green">${space.protocol}</td>\
    <td>${space.ip}</td>\
    <td>${space.port}</td>\
    <td>${space.subordinator}</td>\
    <td>${space.fc}</td>\
    <td>${space.register}</td>\
    <td>${space.count}</td>\
    <td>${space.timeout}</td>\
    <td>${space.outputs}</td>\
    <td>${JSON.stringify(indicator)}</td>\
    ` : `\
    <td bgcolor="red">${space.protocol}</td>\
    <td>${space.ip}</td>\
    <td>${space.port}</td>\
    <td>${space.subordinator}</td>\
    <td>${space.fc}</td>\
    <td>${space.register}</td>\
    <td>${space.count}</td>\
    <td>${space.timeout}</td>\
    <td>${space.outputs}</td>\
    <td>${JSON.stringify(indicator)}</td>\
    `;
    tsb = tsb + `<tr>${app}</tr>`
  }
  let controlString = `<html><body><table>${tsb}</table></body></html>`
  return controlString 
}

function control_2(map3){
  let ts0 = null
  for (let x in map3) {
    let obj = x[0]

    if(!ts0){
      let s0 = ''

      for(var key in obj){
        log.trace(key)
        s0 = s0 + `<th>${key}</th>`
      }
      s0 = `<tr>` + s0 + `<th>Footprint</th>` + `</tr>`
      ts0 = s0
    }

    let resp = x[1]
    let indicator = resp.pop()
    let content = JSON.stringify(indicator)
    let disConnected = content.search(/error/i);
    let s7 = ''
    for(var key in obj){
      log.trace(obj[key])
      s7 = s7 + `<td>${obj[key]}</td>`
    }
    ts0 = ts0 + `<tr>` + s7 + disConnected? `<td  bgcolor="red">${content}</td>`: `<td  bgcolor="green">${content}</td>` + `</tr>`
  }
  return rs0;
}

// raw data report
function report(){
  historyDataArray = arrayize(profilingDictionary)
  customize2Html(historyDataArray)
}
  // let outputRoot = './public/'
  // let candidateArray = (__dirname).split("\\")//'/'
  // let filename = candidateArray[candidateArray.length - 1]
  // let filepath = outputRoot + filename + '.html'
  // let fn = new Date().toISOString.replace(/\\:.;\/ /g, '') + '.html'

module.exports = {
  profilingDictionary: profilingDictionary,
  // decodedDictionary: decodedDictionary,
  refresh: refresh,
  report: report,
  rebuild: rebuild
}