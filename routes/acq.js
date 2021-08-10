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
// let log = (txt)=>{fs.appendFileSync(path.join(process.cwd(), './log.fs.txt'), JSON.stringify(txt) + '\r\n')}
let log4js = require('log4js')
let track = log4js.getLogger('routes::acq')
track.info(new Date())
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
        track.debug(retry, delay, 'backoff...')
        reject({r: retry, d: delay, t: 'backoff'})
      })
      client.on("error", (e) => {
        reject(e)
      })
      await client.connect(spaceConfigure.endpointUrl)
      session = await client.createSession()
      track.debug(`${session} @ [${new Date().toISOString()}] "session created"`)
      
      
      /*below it brings out data response*/
      let responseValues = [];
      for(let i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
        let resp = await session.readVariableValue(spaceConfigure.nodeIds[i].address)

        track.debug(`\r\n${resp}\r\n`)

        responseValues.push(resp)
      }
      track.debug(`updated ${responseValues.length} data points\r\n ${responseValues}`)
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
  track.debug(configure)

  acquire(configure)
  .then((respValues)=>{

    let list = respValues
    res.render('page/list', {
      title: __filename + new Date().toISOString(),
      items: list
    })

    // for(let i = 0; i < list.length; i = i + 1) {
    //   track.warn(list[i])
    //   track.fatal(list[i].value.value)
    //   track.fatal(list[i].statusCode._name)
    //   track.fatal(list[i].serverTimestamp)
    // }

    // fs.writeFileSync(path.join(process.cwd(), './acq.json'), JSON.stringify(res))
    track.debug(respValues)    
  })
  .catch((err)=>{
    res.send(__filename + JSON.stringify(err))
    // fs.appendFileSync(path.join(process.cwd(), './log.md'), JSON.stringify(err) + '\r\n\r\n')
    track.debug(err)
  })

  // res.send('running...')
})