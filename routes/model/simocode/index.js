'use strict'
var express = require('express');
var router = express.Router();
let path = require('path')
let fs = require('fs')
let log4js = require('log4js')
let log = log4js.getLogger('routes::model::simocode')
// const { readCertificate, readCertificateRevocationList, exploreCertificateInfo } = require("node-opcua-crypto");
const async = require("async");
const addArr = require('./SIMOCODE(SIRIUS)1.json')
//const { OPCUAClient, makeBrowsePath, AttributeIds, resolveNodeId, TimestampsToReturn } = require("node-opcua");
const { MessageSecurityMode, SecurityPolicy, OPCUAClient } = require("node-opcua");
const endpointUrl = require('./SIMOCODE(url)1.json').ep;

/* GET listing. */
// router.get('/simocode', function (req, res, next) {
// 	let list1 = [
// 		{ register: 300786, fc: 3 },
// 		{ register: 9001, fc: 4 },
// 	]
// 	res.render("array", {
// 		title: 'matrix',
// 		items: list1,
// 	});
// });

// let _client = OPCUAClient.create({
// 	securityMode: 'None',
// 	securityPolicy: 'None',
// 	endpointMustExist: false,
// 	connectionStrategy: { initialDelay: 200, maxRetry: 0, maxDelay: 20000 },//no retry need
// 	// securityPolicy: SecurityPolicy.Basic256Sha256,
// 	// securityMode: MessageSecurityMode.SignAndEncrypt,
// 	defaultSecureTokenLifetime: 60 * 1000 * 15,//5min
// 	// certificateFile: invalidCertificateFile,
// 	// privateKeyFile,
// 	// serverCertificate,
// 	// clientCertificateManager,
// 	requestedSessionTimeout: 60 * 1000,//1min
// 	clientName: "Client-" + this.clientId,//random Number as Index
// 	keepSessionAlive: false
// })
// _client.on("backoff", () => log.trace("retrying connect-", ++this.retries))
// _client.on("error", () => {
// 	log.error(`url:${this.endpointUrl}, client:${_client} is unreachable`)
// })
// let rawresp = []
// _client.connect(endpointUrl, function (err) {
// 	if (err) {
// 		log.error(err)
// 	} else {
// 		_client.createSession(function (errsess, session) {
// 			if (errsess) {
// 				log.error(errsess)
// 			} else {
// 				session.on('error', (e) => {
// 					log.error({ code: errorCode.startError, e: e, message: 'EOPCUASTACK' })
// 				})
// 				session.on('timeout', (e) => {
// 					log.error({ code: errorCode.timeoutError, e: e, message: 'ETIMEDOUT' })
// 				})
// 				rawresp = []
// 				//
// 				const maxAge = 0;
// 				let arr = []
// 				for (let i = 0; i < addArr.length; i++) {
// 					const nodeToRead = {
// 						nodeId: addArr[i].addr,
// 						attributeId: AttributeIds.Value
// 					}
// 					arr.push(nodeToRead)
// 				}

// 				for (let i = 0, start = 0, end = 0; i < arr.length; i++) {
// 					if (i % 100 == 0) {
// 						end = i
// 						let subArr = arr.slice(start, end);
// 						session.read(subArr, maxAge, function (errRead, dataValue) {
// 							if (!errRead) {
// 								console.log("  % = ", dataValue.toString());
// 								rawresp = rawresp.concat(dataValue)
// 								fs.writeFileSync(path.join(__dirname, './resp-opcua.json'), dataValue.toString(), "a+")//JSON.stringify(dataValue)
// 							}
// 						});
// 						start = end
// 					} else if (arr.length - 1 == i/* the last one*/) {
// 						end = i
// 						let subArr = arr.slice(start, end);
// 						session.read(subArr, maxAge, function (errRead, dataValue) {
// 							if (!errRead) {
// 								console.log(" % = ", dataValue.toString());
// 								rawresp = rawresp.concat(dataValue)
// 								fs.writeFileSync(path.join(__dirname, './resp-opcua.json'), dataValue.toString(), "a+")//JSON.stringify(dataValue)

// 								console.log(" total acquired = ", JSON.stringify(rawresp));
// 								fs.appendFileSync(path.join(__dirname, './raw-opcua.res'), JSON.stringify(rawresp));
// 							}
// 						});
// 					} else {
// 						continue;
// 					}
// 				}
// 				//
// 			}
// 		})
// 	}
// })
/* a remaining issue connecting to SIMOCODE is its CA will be rejected if the device time is incorrect! */

module.exports = router;