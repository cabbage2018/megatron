'use strict'
let bridge = require('./bridge')
let cron = require('node-cron')

let log4js = require('log4js')
let log = log4js.getLogger('bridge::scheduler')

let email = log4js.getLogger('email')
let alert = require('./alert')
let report = require('./report')

// to minimize the downtime of this program, first circle job will initialize a second onion task, which will disappear when finished. 
let taskRoutine = cron.schedule('57 */1 * * * *', () => {

  // report.postman(new Date())
  
  var periodicJob4Reading = setTimeout(
    async () => {
      try{
        let spaceIndicator = require('./spaces.json')

        let spacesAddress = spaceIndicator///require('./configure').load('./spaces.json')
        let resultsJSONObject = bridge.query(spacesAddress)
        .then(async (responseValues)=>{
          let deliverRecords = await bridge.deliver(responseValues)
          
          log.info(deliverRecords)
        })
        .catch((err)=>{
          alert.email({t: new Date(), e: err})
          report.postman(err)
          email.fatal(err)
          })
      }
      catch(e){
        report.postman(e)
        email.fatal(e)
        log.error({h: "Exit main configuration of OPCUA bridge due to configure", m: e})
      }
      
    },
    3000
  )
  
  let ping = {t: new Date(), u: __filename}

  report.postman(ping)

  log.debug(periodicJob4Reading)
        
  // log4js.shutdown()

})

taskRoutine.start()