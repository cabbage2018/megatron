'use strict'
let expect = require('chai').expect
let log4js = require('log4js')
log4js.configure({
  appenders: {
    stdout: {
      type: 'stdout',
    }, 
    troubleshooting: {
      type: 'file',
      maxLogSize: 8388608,
      backups: 3,
      compress : false,
      keepFileExt : true,
      filename: './logs/testing_log.txt',
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['stdout', 'troubleshooting'], level: 'all' }
  }
})
let log = log4js.getLogger('mustFail.WhenMoved.toYourComputer.Test')
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

describe.skip(__filename, function () {
  const mqtt = require('mqtt')
  describe('8.1.1 Connect to OPCUA', function () {
    const {
      AttributeIds,
      OPCUAClient,
      TimestampsToReturn,
    } = require('node-opcua')
    
    let client = OPCUAClient.create({
      endpointMustExist: false
    })

    const spaceConfigure = {
      "endpointUrl": "opc.tcp://192.168.2.118:4840/",
      "nodeIds": [
        {"address": "ns=2;i=32", "name": "ECCS_35kV_Cos_phi"},
        {"address": "ns=3;i=63", "name": "ECCS_35kV_Frequency"},
        {"address": "ns=3;i=120", "name": "ECCS_Boolean_Forwards"},
        {"address": "ns=2;i=108", "name": "PCCS_35kV_Status-General_fault"}
      ]
    }

    before(async () => {
    })

    it(`7.7.4 opc browser`, /*async*/ function (done/**/) {

      const { OPCUAClient, NodeClass } = require("node-opcua");
      const nodeId = "ns=2;i=1"; // RootFolder.Objects.Server
      const endpointUri = "opc.tcp://192.168.2.118:4840/";
      
      (async () => {
          const client = OPCUAClient.create({ endpointMustExist: false})
          client.on("backoff", () => console.log("Backoff: trying to connect to ", endpointUri));

          expect(client !== null, 'client is invalid? ').to.be.true

          await client.withSessionAsync(endpointUri, async (session) => {
          console.log(endpointUri)
      
              let browseResult = await session.browse({
                  nodeId,
                  nodeClassMask: NodeClass.Variable, // we only want sub node that are Variables
                  resultMask: 63 // extract all information possible 
              })
              console.log("BrowseResult = ", browseResult.toString())
          })
      })()

    })

    it.skip(`7.7.4 opc.tcp://192.168.2.118:4840/`, /*async*/ function (done/**/) {
    
      /*await*/ client.connect(spaceConfigure.endpointUrl)
      log.debug(spaceConfigure.endpointUrl)
      let session = /*await*/ client.createSession()
      console.log(`${session} @ [${new Date().toISOString()}] "session created"`)

      client.on("backoff", (retry, delay) => {
        // done('backoff!')
      })

      client.on("error", (e) => {
        // done(e)
      })
    
      try {
        let respArray = []
        for(var i = 0; i < spaceConfigure.nodeIds.length; i = i + 1) {
          let resp = /*await*/ session.readVariableValue(spaceConfigure.nodeIds[i].address)
          respArray.push(resp)
          log.debug(`updated ${resp} from remote`)
          expect(resp !== null, '8.7.5 telemetry resp received? ').to.be.true
        }

      }
      catch (err) {
        done(err)
      }

      // client.on('timeout', ()=>{})
      if(session){
        /*await*/ session.close()
        session = null  
      }
      if(client){
        /*await*/ client.disconnect()
        client = null  
        done()
      }


    })

    
    after(async () => {
    })  
  })
})