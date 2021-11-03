'use strict'
let fs = require('fs')
let path = require('path')
let log4js = require('log4js')
let log = log4js.getLogger('routes::agent::ModbusTCP::device')

// below is specified for constrained MODE of model which
// look at every variant as
// register, format, bit set that is final formal as INT only
// 
// ----------------------------------------------------------------------------------
//      below are raw data preprocess and visualize
// ----------------------------------------------------------------------------------


/*
	{
    "x": 48400,
    
		"r": 17411,
		"c": 4,
    "f": 3,
    
		"type": "CUSTOM",
		"dataset": "4.5.6 Data set DS 68: CubicleBUS Output Module Status",
		"format": "time",
		"d": "System time of the circuit breaker"
	},
	{
    "x": 48401,
    
		"layout": "time",
		"o": 0,
		"b": 8,
    
    "type": "INT",
		"d": "Year"
	},
...
  {
		"x": 48421,
		"layout": "triplog",
		"o": 72,
		"b": 8,
		"type": "ENUM",
		"d": "Reason for tripping operation"
	},
...
  	{
		"layout": "triplog",
		"o": 72,
    "b": 8,
    
		"enumkey": 1,
		"enumvalue": "1 = overload"
	},
	{
		"layout": "triplog",
		"o": 72,
		"b": 8,
		"enumkey": 2,
		"enumvalue": "2 = instantaneous Short circuit"
	},
*/
function list2map(list){
  let regs = new Map()
  for(let i = 0; i < list.length; i = i + 1){
    let item = list[i]

    if(item.enumKey && item.enumValue && item.parent){
      // enum's parent node
      let obj = regs.get(item.parent.toUpperCase())
      if(!obj){
        regs.set(item.parent, new Map())
        obj = regs.get(item.parent)
      }

      // enum entry itself
      let localEnum = obj.matrix
      let kstr = item.o + '::' + item.b + '::' + item.enumKey
      let vstr =  item.enumValue
      if(localEnum){
        localEnum.set(kstr, vstr)
      }else{
        let map = new Map()
        map.set(kstr, vstr)//enum mean
        obj.matrix = map
      }
    } else if(item.next && item.layout){
      // struct
      let pack = regs.get(item.layout.toUpperCase())

      let keys = item.o + '::' + item.b
      let vals = item.next + '::' + item.d

      if(pack){
        pack.set(keys, vals)
      }else{
        let table = new Map()
        table.set(keys, vals)// variant description
        regs.set(item.layout.toUpperCase(), table)//String()
      }
    }else if(item.type /*&& item.format && item.type.indexOf('CUSTOM') >=0*/ ){
      let pack = regs.get(item.r)

      let keys = item.r + '::' + item.c + '::' + item.f
      let vals = item.type.toUpperCase() + '::' + item.dataset + '::' + item.d

      if(pack){
        pack.set(keys, vals)
      }else{
        let table = new Map()
        table.set(keys, vals)// variant description
        regs.set(item.r, table)//Number()
      }
    }
  }
  log.warn(regs.size)
  return regs
}

function display(decoder){
  log.debug(decoder.size)
  for (var x of decoder) {
    log.trace(`${x[0]}:`)
    for (var y of x[1]) {
      log.trace(`reg&struct: ${y[0]}:= ${y[1]}`)
    }
    if(x[1].matrix){
      for (var z of x[1].matrix) {
        log.trace(`[enum]: ${z[0]}:= ${z[1]}`)
      }
    }
  }

  return;
}

function interpret(response, decoder, aggregatorArray){
  let rawStart = Number(response.request._body._start)
  let rawCount = Number(response.request._body._count)
  let buffer = Buffer.from(response.response._body._valuesAsBuffer)

  log.trace(`${rawStart}, ${rawCount}, ${buffer.length}, ${decoder.size}`)

  for (var pair of decoder) {
    let entry = pair[0]
    if( typeof(entry) === 'number' ){
      let posDic = pair[1]

      // might work on different FC., etc.,
      for (var register of posDic) {
        let arr = register[0].split('::')
        let regPos = Number(arr[0])
        let regCnt = Number(arr[1])
        let fc = Number(arr[2])

        let arrb = register[1].split('::')
        let typeOrFormat = arrb[0]
        let dataset = arrb[1]
        let description = arrb[2]
              
        if(regPos >= rawStart && regCnt + regPos <= rawStart + rawCount){
          let winBuf = Buffer.alloc(regCnt * 2)
          buffer.copy(winBuf, 0, (entry.regPos - rawStart) * 2, (regPos - rawStart + regCnt) * 2)//!

          log.debug(regPos, regCnt, fc, '-->', winBuf.toString('hex'), typeOrFormat, dataset, description)

          let arrOut = listRegister(winBuf, fc, typeOrFormat, dataset + '::'+ description, decoder, 1)
          if(arrOut && arrOut.length >0){
            for(let i = 0; i < arrOut.length; i +=1){
              aggregatorArray.push(arrOut[i])
            }
          }
        }
      }
    } else if(typeof(entry) ==='string'){
    }
  }

  for(let i = 0; i < aggregatorArray.length; i +=1){
    log.error(i, JSON.stringify(aggregatorArray[i]))
  }
  return aggregatorArray
}

// register space
function listRegister(buf, fc, typeOrFormat, description, decoder, recursionCycles){
  recursionCycles += 1
  let FormatStr = typeOrFormat.toUpperCase()
  /* directly translate-able*/
  switch (FormatStr) {
    case "FLOAT":
    case "FLOAT32":
    case "DOUBLE":
    case "DOUBLE64":
    case "INT":
    case "INT32":
    case "INT16":
    case "UNSIGNEDINT16":
    case "UNSIGNEDINT32":
    case "SIGNEDINT16":
    case "SIGNEDINT32":
    case "LONG":
    case "LONG32":
    case "BOOLEAN":
    case "BITS":
    case "TIMESTAMP":
    case "STRING":
    case "HEXSTRING":
      let obj = {}
      obj['des'] = description
      obj['val'] = knownType(buf, typeOrFormat)
      return [obj]
    break

    default:
      let result = redirectFormat(buf, typeOrFormat, description, decoder, recursionCycles)
      if(result && result.length>0){
        return result
      }
    break
  }
  return [];
}

function knownType(windowBuf, typeStr){
  switch (typeStr.toUpperCase()) {
    case "FLOAT32":
    case "FLOAT":
      return windowBuf.readFloatBE(0);
    break;

    case "DOUBLE64":
    case "DOUBLE":
      return windowBuf.readDoubleBE(0);
    break;

    case "SIGNEDINT16":
    case "SIGNEDINT":
    case "INT":
      return windowBuf.readInt16BE(0);
    break;

    case "UNSIGNEDINT16":
    case "UNSIGNEDINT":
    case "UINT":
      return windowBuf.readUInt16BE(0);
    break;

    case "UNSIGNEDINT32":
    case "UINT32":
      return windowBuf.readUInt32BE(0);
    break;

    case "SIGNEDINT32":
    case "INT32":
    case "LONG":
      return windowBuf.readInt32BE(0);
    break;

    case "INT64":
    case "LONG64":
    case "LONGLONG":
      return windowBuf.readBigInt64BE(0);
    break;

    case "UNSIGNEDINT64":
    case "UINT64":
    case "UNSIGNEDLONG":
    case "UNSIGNEDLONG64":
    case "ULONG":
    case "ULONG64":
      return windowBuf.readBigUInt64BE(0);
    break;  

    case "BOOLEAN":
      // this is digital input or coil
      return windowBuf[0];
      break;

    case "TIMESTAMP":
      return windowBuf.toString('ascii', 0, windowBuf.length)
    break;
    
    case "STRING": 
      return windowBuf.toString('utf-8', 0, windowBuf.length)
    break;
    
    case "HEXSTRING": 
      return windowBuf.toString('hex', 0, windowBuf.length)
    break;

    default:
      log.fatal(`Malfunction for known TYPE decoder like INT32 and DOUBLE64: ${typeStr}, ${upperDescription}`)
      return null
      // throw new Error('!')
    break;
  }
  return undefined
}

/** 
  this work for byte array pickup, especially for byte aligned buffer
*/
function window(buf, bitOffset, bitCount){
  if(bitOffset + bitCount <= buf.length * 8){
    let byteStart = Math.floor(bitOffset/8)
    let byteEnd = Math.ceil((bitOffset + bitCount)/8)    
    let byteCnt = byteEnd - byteStart
    if(byteCnt > 0){
      let allocBuff = Buffer.alloc(byteCnt, 0x0)
      let copiedByteNumber = buf.copy(allocBuff, 0, byteStart, byteEnd)
      // let allocBuff = Buffer.from(buf, byteStart, byteEnd - byteStart)
      return allocBuff;
    }
  }
  return null;
}

// recursion...X should remove
function redirectFormat(buf, typeFormat, upperDescription, decoder, recursionCycles){
  recursionCycles++
  if(recursionCycles > 7){
    throw new Error('deadlocked!, check decoder"s illicit');
  }
  let collArr=[]

  // otherwise,
  let moreDic = decoder.get(typeFormat)
  if(moreDic){
    for (let coor of moreDic) {
      let arr = coor[0].split('::')
      if(arr.length === 2){
        let bitOffset = Number(arr[0])
        let bitCount = Number(arr[1])
        let barr = coor[1].split('::')
        let childFormat = barr[0]
        let moreDesc = barr[1]
        let accumulatedDesc = upperDescription + '::' + moreDesc


        let cloneBuf = window(buf, bitOffset, bitCount)
        let shiftedOffset = bitOffset - Math.floor(bitOffset/8) *8
        let intermediate = customType(cloneBuf, childFormat, accumulatedDesc, decoder, recursionCycles, shiftedOffset, bitCount)

        if(intermediate && intermediate.length > 0){
          for(let i = 0; i < intermediate.length; i +=1){
            collArr.push(intermediate[i])
          }
          // collArr.concat(intermediate)
          log.trace(intermediate, ` ->> ${intermediate.length} resolved!,;;;${collArr.length};;;`)
        }
      }

      log.trace(`${upperDescription} ->> ${collArr.length} resolved!`)
    }
  }
  return collArr;
}

/*
  convert bytes buffer to an integer, no matter how much length it is.
  but meaningful length should be <6 as Node.js indicated.
*/
function byteArray2Value(byteArrayIn){
  // log.trace(`byteArray2Value function Input: ${byteArrayIn.toString('hex')}`)//utf-8
  switch (byteArrayIn.length) {
    case 1:
      return byteArrayIn.readUInt8(0)
    break;
    case 2:
      return byteArrayIn.readUInt16BE(0) 
    break;
    case 3:
      return byteArrayIn.readUIntBE(0, 3) 
    break;
    case 4:
      return byteArrayIn.readUInt32BE(0) 
    break;
    case 5:
      return byteArrayIn.readUIntBE(0, 5)
    break;
    case 6:
      return byteArrayIn.readUIntBE(0, 6)
    break;
    default:
      log.fatal(`cannot convert byte array ... to integer value: ${byteArrayIn.length}, Language requires bytes < 6!`)
      return null;
      break;
  }
}

function bits2Value(buf2, shiftedOffset, bitCount){
  let realOffset = shiftedOffset
  let interim = byteArray2Value(buf2)
  if(interim){
    let mask = 0
    for (let o = realOffset; o < realOffset + bitCount; o = o + 1) {
      // log.trace(`mask:= ${mask};`)
      mask = mask + (0x1 << o)
    }
    let finalInt = (interim & mask) >> realOffset// keep bits value < 32bit integer!?  
    log.trace(buf2, shiftedOffset, bitCount, `Decode Bits successful:= ${finalInt};`)
    return finalInt;
  }
  return null
}

/*
  only bits, signedchar, unsignedchar are supported on this routine.
  when dealing with so-called bits, shift to byte aligned is the first step.
*/ 
function customType(buf, typeIndicator, description, decoder, recursionCycles, bitOffset, bitCount){
  recursionCycles += 1

  let focusedBuf = buf
  let obj = {}
  obj['des']= description 

  switch (typeIndicator) {
    case "INT":
      if(bitOffset%8 ===0){
        obj['val'] = focusedBuf.readUIntBE(0, focusedBuf.length)//Monitor Error from this part
        return [obj]
      }
    break;

    case "SIGNEDCHAR":
      if(bitCount%8 ===0 && bitOffset%8 ===0 && bitCount/8 ===1){
        obj['val'] = focusedBuf.readInt8(0)
        return [obj]
      }
    break;

    case "UNSIGNEDCHAR":
      if(bitCount%8 ===0 && bitOffset%8 ===0 && bitCount/8 ===1){
        obj['val'] = focusedBuf.readUInt8(0)
        return [obj]
      }
    break;
  
    case "BITS"://enum species can only be touched here
      if(bitOffset%8 ===0 &&  bitCount%8 ===0){
        obj['val'] = byteArray2Value(focusedBuf)
        if(obj['val']){
          let enumSpecies = onEnum(obj['val'], bitOffset, bitCount, typeIndicator, decoder)
          if(enumSpecies){
            log.trace(`Enum decyphored: ${enumSpecies}`)
            obj['enum'] = enumSpecies
          }
        }
        return [obj]
      }else if(bitCount <= 32){
        obj['val'] = bits2Value(focusedBuf, bitOffset, bitCount)
        return [obj]
      }else{
        log.fatal('Bit Count too large to decode!~!@#$%^&*()_+_)(*&^%$#@!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`', bitOffset, bitCount)
      }
      break;

    case "BOOLEAN":
      // return buf.length > 0? buf[0]:undefined;
      break;

    default:
      let updatedDesc = description +'::' + typeIndicator
      return redirectFormat(focusedBuf, typeIndicator, updatedDesc, decoder, recursionCycles);
    break ;
  }
  return []//should not reach here.
}

// CUSTOM FORMAT, like FORMAT(156), decoder.struct
function onEnum(intValue, bitOffset, bitCount, typeIndicator, decoder){
  if(decoder.get(typeIndicator)){
    let enumx = decoder.get(typeIndicator).matrix
    log.debug(enumx)

    let enumxLookupStr = bitOffset + '::' + bitCount + '::' + intValue
    log.debug(enumxLookupStr, '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', statusStr)
    if(enumx.get(enumxLookupStr)){
      let statusStr = enumx.get(enumxLookupStr)
      return statusStr;
    }
  }
  return undefined;
}

function summary(){
  report(historyDataArray)
}

function report(arr){
  log.debug(`arr.length:= ${arr.length}`)

  for (var i = 0; i < arr.length; i = i + 1) {
    let align = arr[i]
    log.debug(i, '...', align)
  }
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
function rebuild(response, arr, matrix){

  // let response = JSON.parse(fs.readFileSync(responsefile, 'utf-8'))

  // let arr = JSON.parse(fs.readFileSync(decoderfile, 'utf-8'))
  log.fatal(arr.length)

  let decoder = list2map(arr)
  // display(decoder)

  let updateArray = interpret(response, decoder, matrix)
  log.debug(updateArray, matrix.length)
  return updateArray
}

module.exports = {
  rebuild: rebuild,
  report: report,
  display: display,
  summary: summary
}