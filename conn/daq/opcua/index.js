
'use strict'
const log4js = require('log4js')
const log = log4js.getLogger('conn::daq::opcua:index')
const {
	AttributeIds,
	OPCUAClient,
	TimestampsToReturn,
} = require("node-opcua")
// let fs = require('fs')
// let path = require('path')
// let readline = require('readline')

module.exports = {
	/*SOME DEVICE LIKE SIMOCODE PROV PN HAS VERY SMALL LIMIT; but SCADA has bigger*/
	acquire: async function (endpointUrl, nodeArray, bulkSize = 1000) {
		var arr = [];
		for (var i = 0; i < nodeArray.length; i += 1) {
			arr.push({ nodeId: nodeArray[i].nodeid, attributeId: AttributeIds.Value });
		}
		let promisePhysicalLayer = new Promise(function (resolve, reject) {
			const client = OPCUAClient.create({
				endpoint_must_exist: false,
				connectionStrategy: {
					maxRetry: 5,
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
			await client.connect(endpointUrl);
			const session = await client.createSession();
			log.debug(`session created`);
			let collect = {};
			collect.arr = [];
			collect['url'] = endpointUrl;
			collect['nodes'] = nodeArray;
			if (bulkSize > 1) {
				const BATCH_SIZE = bulkSize;
				for (var i = 0; i < arr.length / BATCH_SIZE; i += 1) {
					const start = i * BATCH_SIZE
					const stop = (i === arr.length / BATCH_SIZE) ? arr.length : (i + 1) * BATCH_SIZE
					var resp = await session.readVariableValue(arr.slice(start, stop));//read
					collect.arr.concat(resp)
				}
				resolve(collect)
			} else {
				for (var i = 0; i < arr.length; i++) {
					const tmp = await session.read(arr[i])
					collect.arr.push(tmp)
				}
				resolve(collect)
			}
			log.debug(" closing session")
			if (session) {
				await session.close();
				session = null;
			}
			if (client) {
				await client.disconnect();
				client = null;
			}
		})
		return promisePhysicalLayer;
	}
}
