'use strict'
const fs = require("fs");
const path = require("path");
var chai = require('chai');
let log4js = require('log4js')
log4js.configure({
  appenders: {
    stdout: {
      type: 'stdout',
    },
    access: {
      type: 'dateFile',
      filename: path.join(process.cwd(), '/logs/traces.log'),
      pattern: 'yyyy-MM-dd.txt',
      alwaysIncludePattern: true,
    }
  },
  categories: {
    default: { appenders: ['stdout', 'access'], level: 'all' },
  }
})
let log = log4js.getLogger('3wl.acquire.unitTest')

let expect = require('chai').expect
let { acquire
} = require('../../routes/agent/ModbusTCP/modbus')

describe(__filename, function () {

  describe('acquire device', function () {
    
    before(() => {
      log.debug(process.cwd())
    })

    it(`laboratory circuit breaker@192.168.2.135:502`, async function (done) {

      let uri = {
        ip: '192.168.2.135',
        port: 502,
        sub: 126
      }
      let spaces = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/space(03 2020)(ACB3WL).json")))
      uri.start = new Date()
      log.debug(spaces)

      for (let k = 0; k < 100; k++) {
        for (let o = 0; o < spaces.length; o = o + 1) {
          let item = spaces[o]
          item.addr = item.reg - 1
          let fn = uri.ip + '_' + uri.port + '_' + '_' + item.fc + '_' + (item.addr) + '_' + item.cnt + '.json';

          await acquire(
            uri.ip,
            uri.port,
            uri.sub,
            item.fc,
            item.addr,
            item.cnt,
            5000,
            [126, 125, 254]
          )
            .then((response) => {
              fs.writeFileSync(path.join(process.cwd(), fn), JSON.stringify(response))

              // log.debug(response, item, uri)
            })
            .catch((error) => {
              // done(error)
              let fnw = 'Err_' + uri.ip + '_' + uri.port + '_' + '_' + item.fc + '_' + (item.addr) + '_' + item.cnt + '.json';

              error.uri = uri
              error.space = item
              fs.writeFileSync(path.join(process.cwd(), fnw), JSON.stringify(error))

              // log.error(error)
            })

        }

      }

      uri.end = new Date()
      uri.interval = uri.end.getTime() - uri.start.getTime()
      log.debug(`elapsed Time: ${uri.interval}`)

      // expect(results === undefined, `expect${results.length} to equal 0`).to.be.true
    })
    
    after(() => { 
      setTimeout(() => {console.log('Test completed finished.')}, 1000)
    })
  })
})
