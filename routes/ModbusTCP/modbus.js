'use strict'
let modbus = require('jsmodbus')
let net = require('net')
/*
let accumulatedSpace = {
    channel: "modbustcp",
    repeatIntervalMs: 6000,
    protocolData: {
        ip: "127.0.0.1",
        port: 502,
        subordinatorNumber: 127,
        timeoutMs: 6000,
        functionType: 3
    },
    physicalAddress: {
        start: 23309,
        count:100,
        registerGrid: [
            {start: 23309, count: 30},
            {start: 23309, count: 30},
            {start: 23309, count: 30},
            {start: 23309, count: 30}
        ],
    }
}
*/
function acquire(addressSpace){
  let promisePhysicalLayer = new Promise(function (resolve,reject){
    var socket = new net.Socket();
    const client = new modbus.client.TCP(socket, addressSpace.protocolData.subordinatorNumber, addressSpace.protocolData.timeoutMs);
    socket.on('connect', function () {
      switch(addressSpace.protocolData.functionType)
      {
          case 1:
              client.readCoils(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.count)).then(function (resp) {
                  socket.end()
                  resolve(resp)
              }).catch(function (error) {
                  error.start =  Number(addressSpace.physicalAddress.start)
                  error.count = Number(addressSpace.physicalAddress.count)
                  error.fc = addressSpace.protocolData.functionType
                  socket.end()
                  reject(error)
              })
              break;

          case 2:
            client.readDiscreteInputs(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.count)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.start =  Number(addressSpace.physicalAddress.start)
                error.count = Number(addressSpace.physicalAddress.count)
                error.fc = addressSpace.protocolData.functionType
                socket.end()
                reject(error)
            })
            break;

          case 3:
              client.readHoldingRegisters(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.count)).then(function (resp) {
                  socket.end()
                  resolve(resp)
              }).catch(function (error) {
                  error.start =  Number(addressSpace.physicalAddress.start)
                  error.count = Number(addressSpace.physicalAddress.count)
                  error.fc = addressSpace.protocolData.functionType
                  socket.end()
                  reject(error)
              });
          break;

          case 4:
              client.readInputRegisters(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.count)).then(function (resp) {
                  socket.end()
                  resolve(resp)
              }).catch(function (error) {
                  error.start =  Number(addressSpace.physicalAddress.start)
                  error.count = Number(addressSpace.physicalAddress.count)
                  error.fc = addressSpace.protocolData.functionType
                  socket.end()
                  reject(error)
              });
          break;

          case 5:
            client.writeSingleCoil(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.target0_1)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.start =  Number(addressSpace.physicalAddress.start)
                error.count = Number(addressSpace.physicalAddress.count)
                error.fc = addressSpace.protocolData.functionType
                error.write = Number(addressSpace.physicalAddress.target0_1)
                socket.end()
                reject(error)
            });
        break;

        case 6:
            client.writeSingleRegister(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.registerValue)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.start =  Number(addressSpace.physicalAddress.start)
                error.count = Number(addressSpace.physicalAddress.count)
                error.fc = addressSpace.protocolData.functionType
                error.write = Number(addressSpace.physicalAddress.registerValue)
                socket.end()
                reject(error)
            });
        break;

        case 15:
            client.writeMultipleCoils(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.targets0_1)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.start =  Number(addressSpace.physicalAddress.start)
                error.count = Number(addressSpace.physicalAddress.count)
                error.fc = addressSpace.protocolData.functionType
                error.write = ([...addressSpace.physicalAddress.targets0_1])
                socket.end()
                reject(error)
            });
        break;

        case 16:
            client.writeMultipleRegisters(Number(addressSpace.physicalAddress.start), Number(addressSpace.physicalAddress.registerValues)).then(function (resp) {
                socket.end()
                resolve(resp)
            }).catch(function (error) {
                error.start =  Number(addressSpace.physicalAddress.start)
                error.count = Number(addressSpace.physicalAddress.count)
                error.fc = addressSpace.protocolData.functionType
                error.write = ([...addressSpace.physicalAddress.registerValues])
                socket.end()
                reject(error)
            });
        break;

/*
    writeSingleCoil(address: number, value: boolean | 0 | 1): Promise<import("./user-request").IUserRequestResolve<CastRequestBody<Req, WriteSingleCoilRequestBody>>>;
    writeSingleRegister(address: number, value: number): Promise<import("./user-request").IUserRequestResolve<CastRequestBody<Req, WriteSingleRegisterRequestBody>>>;
    writeMultipleCoils(start: number, values: boolean[]): PromiseUserRequest<CastRequestBody<Req, WriteMultipleCoilsRequestBody>>;
    writeMultipleCoils(start: number, values: Buffer, quantity: number): PromiseUserRequest<CastRequestBody<Req, WriteMultipleCoilsRequestBody>>;
    writeMultipleRegisters(start: number, values: number[] | Buffer): Promise<import("./user-request").IUserRequestResolve<CastRequestBody<Req, WriteMultipleRegistersRequestBody>>>;

*/
          default:
              socket.end()
              reject("unsupported: " + addressSpace.protocolData.functionType + "; " + Number(addressSpace.physicalAddress.start) + "; " + Number(addressSpace.physicalAddress.count));
          break;

          }//switch()
      }
    )

    socket.on('error', (error)=>{
        error.ip = addressSpace.protocolData.ip
        error.port = Number(addressSpace.protocolData.port)
        socket.end()
        // client.close()
        reject(error)
    })

    socket.connect({
        'host': addressSpace.protocolData.ip,                       //'192.168.2.42',
        'port': Number(addressSpace.protocolData.port),             //'502'
    })
  })
  return promisePhysicalLayer
}
module.exports = {acquire}