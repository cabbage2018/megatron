'use strict'
let fs = require('fs')
// let path = require('path')
let log4js = require('log4js')
let log = log4js.getLogger('routes::scan')
let {profilingDictionary, refresh, report, rebuild} = require('./device')
let modbustcp = require("./modbus")
// let profilingDictionary = new Map()//assets' inventory!
// let accumulatedSpace = {
//     channel: "modbustcp",
//     repeatIntervalMs: 6000,
//     protocolData: {
//         ip: "127.0.0.1",
//         port: 502,
//         subordinatorNumber: 127,
//         timeoutMs: 6000,
//         functionType: 3
//     },

//     physicalAddress: {
//         start: 23309,
//         count: 100,
//         registerGrid: [
//             {start: 23309, count: 30, functionType: 3},
//             {start: 23309, count: 30},
//             {start: 23309, count: 30},
//             {start: 23309, count: 30}
//         ],
//     }
// }
/*    
    4 tasks
        Tariff sampleing every hour:                                    tariff.json
        event on prompt:                                                event.json
        file when report time reach like 24:00 every day:               report.json
        time series when focus is on:                                   timeseries.json
        realtime sampling can be fullfiled with time series             
        
*/

// ----------------------------------------------------------------------------------
//      below are acquisition functions
// ----------------------------------------------------------------------------------

/*
    modbus.tcp.3wl://192.168.200.250:5022/126/3/?[{r=24040;n=120}]
    modbus.tcp.3rw55://192.168.200.250:5022/126/5/?[{r=34122;o=[312, 555, 279, 100]}]

*/
function convert(str1){
    let regexp = new RegExp(/^(modbustcp|http|https):\/\/([^ "\/]):.+$/, 'gi')
    regexp = new RegExp(/(modbus.tcp|ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)\:([0-9]+)?\/([0-9]+)?\/([0-9]+)?\/\?([^\/]*)/, 'gi')//(\/|\/([\w#!:.?+=&%@!\-\/]))?
    let res1 = {}
    let match1 = regexp.exec(str1)

    for(var k = 0; k < match1.length; k ++){

        switch(k) {
            case 0:
                res1.protocol = match1[k]
            break;
            
            case 1:
            break;

            case 2:
                res1.ip = match1[k]                
            break;

            case 3:
                res1.port = Number(match1[k])              
            break;

            case 4:
                res1.subordinator = Number(match1[k])
            break;

            case 5:
                res1.fc = Number(match1[k])
            break;

            case 6:
                res1.spaces = match1[k]
                console.log(res1.spaces)
            break;

            default:
            break;
          }

          console.log(match1[k])
    }
  
    return res1;
}

function deflate(obj2){
    let arr = JSON.parse(obj2.spaces)
    obj2.addr = []
    const fc = obj2.fc

    for(let i = 0; i < arr.length; i = i + 1){
        obj2.addr.push({
            register: Number(arr[i].r),
            count: (fc === 15 || fc === 16)? JSON.parse(accessaddr.addr[k].count): Number(arr[i].n)
        })
    }
    return obj2
}

/*
    kernal action async.
    deflate physical spaces into addr.
    execute acquire finally.

*/
async function scheduleShorttermRoutine(projets, models){
    refresh()

    const startTimestamp = new Date().getTime()
    log.debug(">>>")

    for(let i = 0; i < projets.length; i = i + 1){
        
        try {
            let json1 = JSON.parse(fs.readFileSync(projets[i]), 'utf-8')

            for(let j = 0; j < json1.length; j = j + 1){
                let sample = json1[j]
                let accesspoint = convert(sample)
                let accessaddr = deflate(accesspoint)

                for(let k = 0; k < accessaddr.addr.length; k = k + 1){
        
                    let space = {
                        model: accesspoint.protocol,//protocol.transport.model://
                        ip: accessaddr.ip, 
                        port: accessaddr.port, 
                        subordinator: accessaddr.subordinator,
                        fc: accessaddr.fc, 
                        register: accessaddr.addr[k].register, 
                        count: accessaddr.addr[k].count, 
                        timeout: 5000, 
                        outputs: accessaddr.addr[k].count
                    }

                    let job1 = setTimeout( async function() {
                        await modbustcp.acquire(
                            accessaddr.ip,
                            accessaddr.port,
                            accessaddr.subordinator,
                            accessaddr.fc, 
                            accessaddr.addr[k].register, 
                            accessaddr.addr[k].count,
                            5000,
                            accessaddr.addr[k].count
                        )
                        .then((responses)=>{
                            // 
                            let device = rebuild(space, responses, models)
                            
                            if(profilingDictionary.get(space)/*undefined*/){
                                // profilingDictionary.get(space).shift() // keep array length always 1
                                profilingDictionary.get(space).push(responses)
                            } else {
                                profilingDictionary.set(space, [responses])
                            }

                        })
                        .catch((error)=>{
                            // mark, unreachable
                            if(profilingDictionary.get(space)/*undefined*/){
                                // profilingDictionary.get(space).shift() // keep array length always 1
                                profilingDictionary.get(space).push(error)
                            } else {
                                profilingDictionary.set(space, [error])
                            }
                    
                            log.error(error)
                        })

                    }, 0) /* Minimum cycle in Node = 1ms and 50ms in Browser mightly */
                }
            }

        } catch (error) {
          log.error(error)
        }
        
    }
    const endTimestamp = new Date().getTime()
    log.debug("<<<: ", endTimestamp-startTimestamp, "'millisecond")

    report()
}
