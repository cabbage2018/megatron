
'use strict'
const log4js = require('log4js')
const log = log4js.getLogger('conn::daq::opcua')
const {
	OPCUAClient, makeBrowsePath, AttributeIds, resolveNodeId, MessageSecurityMode, SecurityPolicy,
	TimestampsToReturn,
	BrowseDirection,
} = require("node-opcua")

module.exports = {
	/*SOME DEVICE LIKE SIMOCODE PROV PN HAS VERY SMALL LIMIT; but SCADA has bigger*/
	acquire: function (endpointUrl, nodeArray/*, bulkSize = 1000*/) {
		var arr = [];
		for (var i = 0; i < nodeArray.length; i += 1) {
			arr.push({ nodeId: nodeArray[i]/*.nodeid*/, attributeId: AttributeIds.Value });
		}

		let promisePhysicalLayer = new Promise(async function (resolve, reject) {

			let client = OPCUAClient.create({
				endpoint_must_exist: false,
				connectionStrategy: {
					maxRetry: 2,
					initialDelay: 2000,
					maxDelay: 10 * 1000
				}
			})

			client.on("backoff", (retry, delay) => {
				reject('backoff')
			})
			client.on("error", (e) => {
				reject(e)
			})
			client.connect(endpointUrl, function (err) {
				if (err) {
					reject(err)
				} else {
					// resolve(client)
					client.createSession(function (err, session) {
						if (err) {
							reject(err)
						} else {
							session.on('error', (e) => {
								reject({ code: errorCode.startError, e: e, message: 'EOPCUASTACK' })
							})
							session.on('timeout', (e) => {
								reject({ code: errorCode.timeoutError, e: e, message: 'ETIMEDOUT' })
							})
							log.mark(`session:${session},`)
							// resolve(session);
							const maxAge = 0
							session.read(arr, maxAge, function (err, dataValue) {
								if (!err) {
									// let dca = JSON.parse(JSON.stringify(dataValue))//deep cloned array
									log.mark("->:", dataValue)
									resolve(dataValue);

									log.debug(" closing session")
									if (session) {
										session.close();
									}
									if (client) {
										client.disconnect();
									}
								} else {
									reject(err)
								}
							})
							log.mark("value read!");
						}
					})
					log.debug(`session created`);
				}
			})
			log.debug(`remote connected`);
		})
		return promisePhysicalLayer;
	}
}
