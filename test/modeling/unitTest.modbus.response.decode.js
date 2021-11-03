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
let log = log4js.getLogger('3wl.unitTest')

let expect = require('chai').expect
let {   rebuild,
   report,
   display,
   summary
} = require('../../routes/agent/ModbusTCP/device')

describe(__filename, function () {

  describe('load response for decode', function () {
    
    console.log(__dirname)
    before(() => {
      // let decoder = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/decode.json")))
      // log.debug(decoder)
      // let response = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/REGISTER/13568_121_3_.json")))
      // log.debug(response)

    })
//
      it(`not_hit-17408_23_3_`, function () {
        let response = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/REGISTER/17408_23_3_.json")))
        log.debug(response)

        let decoder = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/decode.json")))
        // log.debug(decoder)
        let resarr = []
        let results = rebuild(response, decoder, resarr)

        expect(results === undefined, `expect${results.length} to equal 0`).to.be.true
      })

    // it(`not_hit-13568_121_3`, function () {
    //   let response = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/REGISTER/13568_121_3_.json")))
    //   log.debug(response)

    //   let decoder = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/decode.json")))
    //   // log.debug(decoder)
    //   let resarr = []
    //   let results = rebuild(response, decoder, resarr)

    //   expect(results === undefined, `expect${results.length} to equal 0`).to.be.true
    // })

    it(`not_hit-13824_121_3_`, function () {
      let decoder = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/decode.json")))
      let response = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/REGISTER/13824_121_3_.json")))
      let resarr = []
      let results = rebuild(response, decoder, resarr)

      expect(results.length === 0, `expect${results.length} to equal 0`).to.be.true
    })

    it(`not_hit-25600_50_3_`, function () {
      let decoder = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/decode.json")))
      let response = JSON.parse(fs.readFileSync(path.join(__dirname, "../../public/vba/ACB3WL/REGISTER/25600_50_3_.json")))
      let resarr = []
      let results = rebuild(response, decoder, resarr)

      expect(results.length === 0, `expect${results.length} to equal 0`).to.be.true
    })
    
    after(() => {      
      setTimeout(() => {console.log('Test completed finished.')}, 1000)
      summary()
    })
  })
})