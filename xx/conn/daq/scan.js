'use strict'
let modbustcp = require('./modbustcp')
let opcua = require('./opcua')
let snap7 = require('./snap7')
let {probe} = require('./restful');
let emulator = require('./emulator')
let queue = [modbustcp, opcua, snap7, probe, emulator];
// scan remote, to find its accessibility.
let instances = [];
(async ()=>{
  for (var i = 0; i < instances.length; i++) {
		let remote = instances[i];
    console.log(`synchronously run: `, remote.identity + remote.uri);
    const body = await remote.commissioning(remote.spaces);
		console.log(body);
	}
})