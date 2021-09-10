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
function acquire(ensembleAddress){
  let promisePhysicalLayer = new Promise(function (resolve,reject){
    var socket = new net.Socket();
    const client = new modbus.client.TCP(socket, ensembleAddress.protocolData.subordinatorNumber||502, ensembleAddress.protocolData.timeoutMillisecond||3000);
    socket.on('connect', function () {
      switch(ensembleAddress.functioncode)
      {
          case 1:
              client.readCoils(Number(ensembleAddress.register), Number(ensembleAddress.quantity)).then(function (resp) {
                  socket.end()
                  resolve(resp)
              }).catch(function (error) {
                  error.detail = ensembleAddress
                  socket.end()
                  reject(error)
              })
              break;

          case 2:
            client.readDiscreteInputs(Number(ensembleAddress.register), Number(ensembleAddress.quantity)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.detail = ensembleAddress
                socket.end()
                reject(error)
            })
            break;

          case 3:
              client.readHoldingRegisters(Number(ensembleAddress.register), Number(ensembleAddress.quantity)).then(function (resp) {
                  socket.end()
                  resolve(resp)
              }).catch(function (error) {
                  error.detail = ensembleAddress

                  if (ensembleAddress.unreachable) {
                      ensembleAddress.unreachable += 1
                  } else {
                      ensembleAddress.unreachable = 1
                  }
                  ensembleAddress.lastError = new Date()

                  socket.end()
                  reject(error)
              });
          break;

          case 4:
              client.readInputRegisters(Number(ensembleAddress.register), Number(ensembleAddress.quantity)).then(function (resp) {
                  socket.end()
                  resolve(resp)
              }).catch(function (error) {
                  error.detail = ensembleAddress
                  socket.end()
                  reject(error)
              });
          break;

          case 5:
            client.writeSingleCoil(Number(ensembleAddress.register), Number(ensembleAddress.target0_1)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.detail = ensembleAddress
                error.write = Number(ensembleAddress.target0_1)
                socket.end()
                reject(error)
            });
        break;

        case 6:
            client.writeSingleRegister(Number(ensembleAddress.register), Number(ensembleAddress.registerValue)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.detail = ensembleAddress
                // error.write = Number(ensembleAddress.registerValue)
                socket.end()
                reject(error)
            });
        break;

        case 15:
            client.writeMultipleCoils(Number(ensembleAddress.register), Number(ensembleAddress.targets0_1 || 1)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.detail = ensembleAddress
                // error.write = ([...ensembleAddress.targets0_1])
                socket.end()
                reject(error)
            });
        break;

        case 16:
            client.writeMultipleRegisters(Number(ensembleAddress.register), Number(ensembleAddress.registerValues)||[0xffff]).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.detail = ensembleAddress
                // error.write = ([...ensembleAddress.registerValues])
                socket.end()
                reject(error)
            });
        break;

          default:
              socket.end()
              ensembleAddress.wrongfunctioncode = true
              reject(ensembleAddress)
          break;

          }//switch()
      }
    )

    socket.on('error', (error)=>{
        error.ip = ensembleAddress.protocolData.ip
        error.port = Number(ensembleAddress.protocolData.port)
        socket.end()
        reject(error)
    })

    socket.connect({
        'host': ensembleAddress.protocolData.ip,                       //'192.168.2.42',
        'port': Number(ensembleAddress.protocolData.port),             //'502'
    })
  })
  return promisePhysicalLayer
}
module.exports = {acquire}