'use strict'
const log4js = require('log4js')
const log = log4js.getLogger('opcua')
const {
	OPCUAClient, makeBrowsePath, AttributeIds, resolveNodeId, MessageSecurityMode, SecurityPolicy,
	TimestampsToReturn,
	BrowseDirection,
} = require("node-opcua")

class opcua {
	/**
	 * must have: uri(ip, port, uri: tcp.udp://iot.azure.winccoa.com.cn:48400/UAServer)
	 * 
	 * spaces: ["ns=2;i=19847", "ns=3;s=\"scada.screw.dump\""], 
	 * 
	 * timeout, 
	 * write buffer
	 * ::promisePhysicalLayer
	 * 
	 */
	constructor() {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.protocol = "opcua";
		this.identity = "opcua plugin";
		this.client = undefined;
	}

	register(callback) {
	}

	heartbeat() {
		console.log(`it is alive @${__filename},`);
	}

	disconnect() {
		return new Promise(function (resolve, reject) {
			setTimeout(resolve, 0);
		});
	}

	close() {
		this.disconnect()
		.then()
		.catch();
	}

	test(options){
		let that = this;
		return new Promise(function (resolve, reject) {
		})
	}

	connect(options = null) {
		let that = this;
		return new Promise(function (resolve, reject) {
			that.client = OPCUAClient.create({
				endpoint_must_exist: false,
				connectionStrategy: {
					maxRetry: 3,
					initialDelay: 1000,
					maxDelay: 10000
				}
			})
			client.on("backoff", (retry, delay) => {
				reject('backoff')
			})
			
			client.connect(endpointUrl, function (err) {
				if (err) {
					reject(err)
				} else {
					log.debug(`remote connected`);
			
				}
			})
			
			client.on("error", (e) => {
				reject(e)
			})
		});
	}

	commissioning(spaces){
		let that = this;
		// opcua driver can synchronously read a bulk of node-Ids
		var arr = [];
		for (var i = 0; i < spaces.nodeArray.length; i += 1) {
			arr.push({ nodeId: spaces.nodeArray[i], attributeId: AttributeIds.Value });
		}
		that.bulkSize = spaces.bulkSize??100;

		return new Promise(function (resolve, reject) {	
			// resolve(client)
			that.client.createSession(function (err, session) {
				if (err) {
					reject(err)
				} else {
					that.session = session;
					that.session.on('error', (e) => {
						reject({ code: errorCode.startError, e: e, message: 'EOPCUASTACK' })
					})
					that.session.on('timeout', (e) => {
						reject({ code: errorCode.timeoutError, e: e, message: 'ETIMEDOUT' })
					})
					log.mark(`session:${session},`)
					// resolve(session);
					const maxAge = 0
					session.read(arr, maxAge, function (err, dataValue) {
						if (!err) {
							// let dca = JSON.parse(JSON.stringify(dataValue))//deep cloned array
							if (that.session) {
								log.debug(" closing session");
								that.session.close();
							}
							if (that.client) {
								that.client.disconnect();
							}

							// setTimeout(() => {
							// 	dataValue.addr = nodeArray;
							// 	resolve(dataValue);
							// }, 10);

						} else {
							reject(err)
						}
					})
					log.mark("value read!");
				}
			})
			log.debug(`session created`);
		})
	}
}
util.inherits(opcua, events.EventEmitter)
module.exports = opcua
	
/* 
	note:
	SOME DEVICE LIKE SIMOCODE PROV PN HAS VERY SMALL LIMIT; but SCADA has bigger

	intrinsinc parameter for avoid this error is bulk size:
	 bulkSize = 100
*/