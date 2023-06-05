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
      compress: false,
      keepFileExt: true,
      filename: './logs/test-trace.txt',
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['stdout', 'troubleshooting'], level: 'all' }
  }
})
let log = log4js.getLogger('unitTest.opcua.connect.gothrough.Test')
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
describe(__filename, function () {
  const {
      AttributeIds,
      OPCUAClient,
      SecurityPolicy,
      TimestampsToReturn,
      MessageSecurityMode,
  } = require('node-opcua')
  const { readCertificate, readCertificateRevocationList, exploreCertificateInfo } = require("node-opcua-crypto");
  // const serverCertificate = readCertificate(server.certificateFile);
  describe('SIMOCODE-PROV-PN, Connect to OPCUA',  function () {
    let client;
    before( (done) => {
      setTimeout(function () {      
        done();
      }, 1000) 
    })
    const idArray = [
      { "address": "ns=2;i=11", "cat": "Acyclic" },
      { "address": "ns=2;i=12", "cat": "Acyclic" },
      { "address": "ns=2;i=13", "cat": "Acyclic" },
      { "address": "ns=2;i=14", "cat": "Acyclic" },
      { "address": "ns=2;i=15", "cat": "Acyclic" },
      { "address": "ns=2;i=16", "cat": "Acyclic" },
      { "address": "ns=2;i=17", "cat": "Acyclic" },
      { "address": "ns=2;i=18", "cat": "Acyclic" },
      { "address": "ns=2;i=19", "cat": "Acyclic" },
      { "address": "ns=2;i=20", "cat": "Acyclic" },
      { "address": "ns=2;i=21", "cat": "Acyclic" },
      { "address": "ns=2;i=22", "cat": "Acyclic" },
      { "address": "ns=2;i=23", "cat": "Acyclic" },
      { "address": "ns=2;i=24", "cat": "Acyclic" },
      { "address": "ns=2;i=25", "cat": "Acyclic" },
      { "address": "ns=2;i=26", "cat": "Acyclic" },
      //
      { "address": "ns=2;i=30", "cat": "Measured" },
      { "address": "ns=2;i=31", "cat": "Measured" },
      { "address": "ns=2;i=33", "cat": "Measured" },
      { "address": "ns=2;i=39", "cat": "Measured" },
      { "address": "ns=2;i=50", "cat": "Measured" },
      { "address": "ns=2;i=51", "cat": "Measured" },
      { "address": "ns=2;i=62", "cat": "Measured" },
      { "address": "ns=2;i=63", "cat": "Measured" },
      { "address": "ns=2;i=65", "cat": "Measured" },
      { "address": "ns=2;i=69", "cat": "Measured" },
      //
      { "address": "ns=2;i=70", "cat": "Statistics" },
      { "address": "ns=2;i=71", "cat": "Statistics" },
      { "address": "ns=2;i=72", "cat": "Statistics" },
      { "address": "ns=2;i=73", "cat": "Statistics" },
      { "address": "ns=2;i=74", "cat": "Statistics" },
      { "address": "ns=2;i=75", "cat": "Statistics" },
      { "address": "ns=2;i=62", "cat": "Statistics" },
      { "address": "ns=2;i=95", "cat": "Statistics" },
      { "address": "ns=2;i=96", "cat": "Statistics" },
      { "address": "ns=2;i=99", "cat": "Statistics" },
      //
      { "address": "ns=2;i=108", "cat": "Diagnostic" },
      { "address": "ns=2;i=109", "cat": "Diagnostic" },
      { "address": "ns=2;i=110", "cat": "Diagnostic" },
      { "address": "ns=2;i=111", "cat": "Diagnostic" },
      { "address": "ns=2;i=112", "cat": "Diagnostic" },
      { "address": "ns=2;i=115", "cat": "Diagnostic" },
      { "address": "ns=2;i=131", "cat": "Diagnostic" },
      { "address": "ns=2;i=132", "cat": "Diagnostic" },
      { "address": "ns=2;i=135", "cat": "Diagnostic" },
      { "address": "ns=2;i=139", "cat": "Diagnostic" },
      //
      { "address": "ns=2;i=140", "cat": "events" },
      { "address": "ns=2;i=141", "cat": "events" },
      { "address": "ns=2;i=142", "cat": "events" },
      { "address": "ns=2;i=155", "cat": "events" },
      { "address": "ns=2;i=165", "cat": "events" },
      { "address": "ns=2;i=175", "cat": "events" },
      { "address": "ns=2;i=185", "cat": "events" },
      { "address": "ns=2;i=195", "cat": "events" },
      { "address": "ns=2;i=205", "cat": "events" },
      { "address": "ns=2;i=235", "cat": "events" },
      //
      { "address": "ns=2;i=236", "cat": "warnings" },
      { "address": "ns=2;i=237", "cat": "warnings" },
      { "address": "ns=2;i=238", "cat": "warnings" },
      { "address": "ns=2;i=239", "cat": "warnings" },
      { "address": "ns=2;i=240", "cat": "warnings" },
      { "address": "ns=2;i=244", "cat": "warnings" },
      { "address": "ns=2;i=245", "cat": "warnings" },
      { "address": "ns=2;i=282", "cat": "warnings" },
      { "address": "ns=2;i=293", "cat": "warnings" },

      //trips
      { "address": "ns=2;i=294", "cat": "warnings" },
      { "address": "ns=2;i=295", "cat": "warnings" },
      { "address": "ns=2;i=296", "cat": "warnings" },
      { "address": "ns=2;i=297", "cat": "warnings" },
      { "address": "ns=2;i=240", "cat": "warnings" },
      { "address": "ns=2;i=364", "cat": "warnings" },
      { "address": "ns=2;i=365", "cat": "warnings" },
      { "address": "ns=2;i=372", "cat": "warnings" },
      //Diagnostic
      { "address": "ns=2;i=388", "cat": "Diagnostic warnings" },
      { "address": "ns=2;i=390", "cat": "Diagnostic warnings" },
      { "address": "ns=2;i=391", "cat": "Diagnostic warnings" },
      { "address": "ns=2;i=396", "cat": "Diagnostic warnings" },
      { "address": "ns=2;i=397", "cat": "Diagnostic warnings" },
      { "address": "ns=2;i=404", "cat": "Diagnostic warnings" },

      //Diagnostic events
      { "address": "ns=2;i=420", "cat": "Diagnostic events" },
      { "address": "ns=2;i=421", "cat": "Diagnostic events" },
      { "address": "ns=2;i=422", "cat": "Diagnostic events" },
      { "address": "ns=2;i=423", "cat": "Diagnostic events" },
      { "address": "ns=2;i=433", "cat": "Diagnostic events" },
      { "address": "ns=2;i=444", "cat": "Diagnostic events" },

      //Acyclic send
      { "address": "ns=2;i=450", "cat": "Acyclic send" },
      { "address": "ns=2;i=451", "cat": "Acyclic send" },
      { "address": "ns=2;i=422", "cat": "Acyclic send" },
      { "address": "ns=2;i=465", "cat": "Acyclic send" },
      //Measured values
      { "address": "ns=2;i=466", "cat": "Measured values" },
      { "address": "ns=2;i=467", "cat": "Measured values" },
      { "address": "ns=2;i=468", "cat": "Measured values" },
      { "address": "ns=2;i=471", "cat": "Measured values" },
    ]

    const subArray = [
      'ns=2;i=471',
      'ns=2;i=30',
    ]
    const nodeId = "ns=2;i=1"; // RootFolder.Objects.Server
    const endpointUrl = "opc.tcp://192.168.2.25:4840"; //function (endpointUrl, nodeArray)
    client = OPCUAClient.create({
      // securityMode: MessageSecurityMode.SignAndEncrypt,
      // securityPolicy: SecurityPolicy.Basic128Rsa15,
      // securityMode: MessageSecurityMode.None,
      // securityPolicy: SecurityPolicy.None,
      securityMode: 'None',
      securityPolicy: 'None',
      endpointMustExist: false,
      connectionStrategy: {
        maxRetry: 1,
        initialDelay: 5000,
        maxDelay: 25000
      }
    })
    client.on("backoff", (retry, delay) => {
      log.error({ r: retry, d: delay, t: 'backoff' })
    })
    client.on("error", (e) => {
      log.error(e)
    })
    client.on("connected", () => {
      // done()
      log.error(client);
    })
    it(` opc ua create & connect`, async function (/*done*/) {
    })
    let session;
    it(` opc ua create session`, async function (/*done*/) {
      //# start session
      await client.createSession(function (errSess, curSession) {
        log.debug('**')
        if (errSess) {
          log.error(errSess)
        } else {
          session = curSession;
          session.on('error', (e) => {
            log.error({ code: errorCode.startError, e: e, message: 'EOPCUASTACK' })
          })
          session.on('timeout', (e) => {
            log.error({ code: errorCode.timeoutError, e: e, message: 'ETIMEDOUT' })
          })
          log.warn(session)
        }
      })
    })
    it(` opc ua connect remote`, async function (/*done*/) {
      await session.browse("RootFolder", function (err, browseResult) {
        if (!err) {
          console.log("Browsing rootfolder: ");
          for (let reference of browseResult.references) {
            console.log(reference.browseName.toString(), reference.nodeId.toString());
          }
          // done()
        } else {
          log.error(err);
        }
      });
    })

    it(` opc ua read`, async function (/*done*/) {
      var arr = [];
      for (var i = 0; i < idArray.length; i += 1) {
        arr.push({ nodeId: idArray[i].address, attributeId: AttributeIds.Value });
      }
      //#measure
      await session.readVariableValue(arr, function (errRead, dataValue) {
        log.debug('***')
        if (!errRead) {
          log.mark(" % = ", dataValue)
        } else {
          log.error(`err:${errRead}, `)
        }
      })
    })
    it(` opc ua readII`, async function (/*done*/) {
      const maxAge = 0;
      const nodeToRead = {
        nodeId: "ns=2;i=133",
        attributeId: AttributeIds.Value
      };
      await session.read(nodeToRead, maxAge, function (err, dataValue) {
        if (!err) {
          console.log(" ns=2;i=133 = ", dataValue.toString());
        }
        // done();
      });
    })
    it(` opc ua i=85`, async function (/*done*/) {
      //#browse
      await session.browse("ns=0;i=85", function (errBrow, browseResult) {
        log.debug('***')
        if (errBrow) {
          log.error(errBrow)
        } else {
          log.mark("Browsing rootfolder: ", browseResult)
          for (let reference of browseResult.references) {
            log.warn(reference.browseName.toString(), reference.nodeId.toString());
          }
        }
      })
    })
    it(` opc ua i=86`, async function (/*done*/) {
      //#browse
      await session.browse("ns=0;i=86", function (errBrow, browseResult) {
        log.debug('***')
        if (errBrow) {
          log.error(errBrow)
        } else {
          log.mark("Browsing rootfolder: ", browseResult)
          for (let reference of browseResult.references) {
            log.warn(reference.browseName.toString(), reference.nodeId.toString());
          }
        }
      })
    })
    it(` opc ua i=87`, async function (/*done*/) {
      //#browse
      await session.browse("ns=0;i=87", function (errBrow, browseResult) {
        log.debug('***')
        if (errBrow) {
          log.error(errBrow)
        } else {
          log.mark("Browsing rootfolder: ", browseResult)
          for (let reference of browseResult.references) {
            log.warn(reference.browseName.toString(), reference.nodeId.toString());
          }
        }
      })
    })

    it(` install sub and monitor`, function (/**/) {
      // step 5: install a subscription and install a monitored item for 10 seconds
      const subscriptionOptions = {
        maxNotificationsPerPublish: 1000,
        publishingEnabled: true,
        requestedLifetimeCount: 100,
        requestedMaxKeepAliveCount: 10,
        requestedPublishingInterval: 1000
      }
      session.createSubscription2(subscriptionOptions, (errSubs2, subscription) => {
        log.debug('****')
        if (errSubs2) {
          log.error(errSubs2);
        } else {
          subscription
            .on("started", () => {
              log.mark("subscription started for 2 seconds - subscriptionId=", subscription.subscriptionId);
              log.info(subscription)
            })
            .on("keepalive", function () {
              log.mark("subscription keepalive");
            })
            .on("terminated", function () {
              log.mark("terminated");
            });
          const itemToMonitor = {
            nodeId: resolveNodeId("ns=2;i=102"),
            attributeId: AttributeIds.Value
          };
          const monitoringParamaters = {
            samplingInterval: 250,
            discardOldest: true,
            queueSize: 10
          };
          //# real-time monitoring
          subscription.monitor(
            itemToMonitor,
            monitoringParamaters,
            TimestampsToReturn.Both,
            (errMoni, monitoredItem) => {
              log.debug('*****')
              if (errMoni) {
                log.error(errMoni)
              } else {
                monitoredItem.on("changed", function (dataValue) {
                  log.warn("monitored item changed:  % free mem = ", dataValue.value.value);
                });
                log.info("monitoring started");
              }
              //# wait a little bit : 30 seconds
              setTimeout(() => {
                log.info("------------------Terminate the monitored alert-------------------");
                log.debug('*****')
                subscription.terminate()
                //
                session.close(function (errTerm) {
                  if (errTerm) {
                    log.error("closing session failed ?");
                  } else {
                    log.debug('******')
                    client.disconnect()
                    done()//'disconnecting'
                    log.debug("Terminated session")
                  }
                });
              }, 30 * 1000);
              //# wait a little bit : 30 seconds
            }
          );
          //# real-time monitoring
        }
      });
          // step 5: install a subscription and install a monitored item for 10 seconds
    })

    after(async () => {
      log.debug(session);
      log.debug(client);
    })

  })
})

