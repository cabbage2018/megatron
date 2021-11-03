'use strict'
let modbus = require('jsmodbus')
let net = require('net')
/*
let accumulatedSpace = {
    "channel": "modbustcp",
    "repeatIntervalMs": 6000,
    "protocolData": {
        ip: "127.0.0.1",
        port: 502,
        subordinatorNumber: 127,
        timeoutMillisecond: 6000,
        functioncode: 3
    },
	"array": [
		{
            "protocolData": {
                "ip": "127.0.0.1",
                "port": 502,
                "subordinatorNumber": 127,
                "timeoutMillisecond": 6000,
                },

			"register": 13056,
			"quantity": 119,
			"signals": "4.5.2 Data set DS 51: Main overview",
            "functioncode": 3
		},...
    }
}
*/

/*
    assume that caller has no predesessor infor
    that is, only plain data type like int and string are used
    only exception is the last parameter outputs 
        boolean[] for write coil or 
        int[] for write register

*/
async function acquire(ip, port, sub, fc, register, count, timeout, outputs){

    if(typeof(ip) !== 'string'){
        throw new Error('Wrong IP')
    }
    if(typeof(port) != 'number' || port < 0){
        throw new Error('Wrong port Number')
    }
    if(typeof(sub) != 'number' || sub > 126 || sub < 0){
        throw new Error('Wrong subordinator Number')
    }
    if(typeof(fc) != 'number' || fc > 126 || fc < 0){
        throw new Error('Wrong function code Number')
    }
    if(typeof(register) != 'number' || register < 0){
        throw new Error('Wrong register Start')
    }
    if(typeof(count) != 'number' || count < 0){
        throw new Error('Wrong register count')
    }

    const ms = (timeout > 60000 || timeout < 0) ? 5000: timeout

    let promisePhysicalLayer = new Promise(function (resolve,reject){
        const socket = new net.Socket();
        const client = new modbus.client.TCP(socket, sub, timeout)
        
        socket.on('connect', function () {
            switch(fc)
            {
                case 1:
                    client.readCoils(register, count).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        error.register = register
                        error.count = count
                        error.fc = fc
                        socket.end()
                        reject(error)
                    })
                    break;

                case 2:
                    client.readDiscreteInputs(register, count).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        error.register = register
                        error.count = count
                        error.fc = fc
                        socket.end()
                        reject(error)
                    })
                    break;

                case 3:
                    client.readHoldingRegisters(register, count).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        // error.detail = ensembleAddress
                        // if (ensembleAddress.unreachable) {
                        //     ensembleAddress.unreachable += 1
                        // } else {
                        //     ensembleAddress.unreachable = 1
                        // }
                        // ensembleAddress.lastError = new Date()
                        socket.end()
                        reject(error)
                    });
                break;

                case 4:
                    client.readInputRegisters(register, count).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        error.detail = ensembleAddress
                        socket.end()
                        reject(error)
                    });
                break;

                case 5:
                    client.writeSingleCoil(register, outputs).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        error.register = register
                        error.outputs = outputs
                        socket.end()
                        reject(error)
                    });
                break;

                case 6:
                    client.writeSingleRegister(register, outputs).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        error.outputs = outputs
                        socket.end()
                        reject(error)
                    });
                break;

                case 15:
                    client.writeMultipleCoils(register, outputs).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        error.outputs = outputs
                        socket.end()
                        reject(error)
                    });
                break;

                case 16:
                    client.writeMultipleRegisters(register, outputs).then(function (resp) {
                        socket.end()
                        resolve(resp)
                    }).catch(function (error) {
                        error.outputs = outputs
                        socket.end()
                        reject(error)
                    });
                break;

                default:
                    socket.end()                                   
                    reject('Unsupported function code =' + fc)
                break;

                }//switch()
            }
        )

        socket.on('error', (error)=>{
            error.ip = ip
            error.port = port
            socket.end()
            reject(error)
        })

        socket.connect({
            'host': ip,                             //'192.168.2.42',
            'port': port,                           //'502'
        })
    })
    return promisePhysicalLayer
}
module.exports = {acquire}