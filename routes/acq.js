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

function acquire(spaceConfigure) {
  let acquisitionPromise = new Promise(async function (resolve, reject) {
    let client = OPCUAClient.create({
      endpointMustExist: false
    })
    client.on("backoff", (retry, delay) => {
      console.log(retry, delay, 'backoff...')
      reject({r: retry, d: delay, t: 'backoff'})
    })
    client.on("error", (e) => {
      reject(e)
    })
    await client.connect(spaceConfigure.endpointUrl)
    const session = await client.createSession()
    console.log(`${session} @ [${new Date().toISOString()}] "session created"`)
		try {
      let responseValues = [];
      for(var i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
        let resp = await session.readVariableValue(spaceConfigure.nodeIds[i].address)
        console.log(resp)
        responseValues.push(resp)
      }
      log.debug(`updated ${responseValues.length} data points`)
      resolve(responseValues)
    }
    catch (err) {
      await session.close()
			await client.disconnect()						
			reject(err)
    }
    await session.close()
    await client.disconnect()
  })
  return acquisitionPromise
}

/* GET web page. */
router.get('/', function(req, res, next) {
  let configure = require(path.join(process.cwd(), 'opcua.json'))
  console.log(configure)

  acquire(configure)
  .then((res)=>{

    let list = res
    res.render('list', {
      title: __filename + new Date().toISOString(),
      items: list
    })
    fs.writeFileSync(path.join(process.cwd(), './acq.json'), JSON.stringify(res))

  })
  .catch((err)=>{
    res.send(__filename + JSON.stringify(err))
    fs.writeFileSync( path.join(process.cwd(), './acq-e.json'), JSON.stringify(err))
  })

  // res.send('running...')
})
