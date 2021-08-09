'use strict'
let express = require('express');
let router = express.Router();
module.exports = router;
let path = require("path")
let fs = require("fs")
const {
  AttributeIds,
  OPCUAClient,
  TimestampsToReturn,
} = require('node-opcua')
let log = (txt)=>{fs.appendFileSync(path.join(process.cwd(), './log.fs.txt'), JSON.stringify(txt) + '\r\n')}
// let log4js = require('log4js')
// let track = log4js.getLogger('routes::acq')
// track.info(new Date())
// track.warn(`process.cwd() ${process.cwd()}`)

function acquire(spaceConfigure) {
  let acquisitionPromise = new Promise(async function (resolve, reject) {
    let client = null
    let session = null

		try {
      client = OPCUAClient.create({
        endpointMustExist: false
      })
      client.on("backoff", (retry, delay) => {
        log(retry, delay, 'backoff...')
        reject({r: retry, d: delay, t: 'backoff'})
      })
      client.on("error", (e) => {
        reject(e)
      })
      await client.connect(spaceConfigure.endpointUrl)
      session = await client.createSession()
      log(`${session} @ [${new Date().toISOString()}] "session created"`)
      
      
      /*below it brings out data response*/
      let responseValues = [];
      for(var i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
        let resp = await session.readVariableValue(spaceConfigure.nodeIds[i].address)
        log(resp)
        responseValues.push(resp)
      }
      log(`updated ${responseValues.length} data points`)
      resolve(responseValues)
    } catch (err) {
      
      if(session) {
        await session.close()
        session = null  
      }
      if(client) {
        await client.disconnect()
        client = null  
      }
      
      reject(err)
    }

    if(session) {
      await session.close()
      session = null  
    }
    if(client) {
      await client.disconnect()
      client = null  
    }
  })
  return acquisitionPromise
}

/* GET web page. */
router.get('/', function(req, res, next) {
  let configure = JSON.parse(fs.readFileSync(path.join(process.cwd(), './opcua.json')))
  log(configure)

  acquire(configure)
  .then((res)=>{

    let list = res
    res.render('list', {
      title: __filename + new Date().toISOString(),
      items: list
    })
    // fs.writeFileSync(path.join(process.cwd(), './acq.json'), JSON.stringify(res))
    log(res)
    
  })
  .catch((err)=>{
    res.send(__filename + JSON.stringify(err))
    // fs.appendFileSync(path.join(process.cwd(), './log.md'), JSON.stringify(err) + '\r\n\r\n')
    log(err)
  })

  // res.send('running...')
})