'use strict'
let log4js = require('log4js');
let log = log4js.getLogger('routes::equipments');

/* 
	Device manager, add type/model of device instance via
	protocol such as modbus, opcua, iec60870-5-104, bacnet, iec61850, profinet/profibus,.
	3rd party system like SCADA, DCS, etc.,

	record this history model to cache for further.

	en, how to?

	*/
class equipments {
	constructor() {
		this.des = "save ecosystem with limiting usage of resource and energy";
		this.identity = "equipments manager";
		this.cache = new Map();
	}

	add(instance){
		this.cache.set(instance.protocol + "-" + instance.uri, instance);
	}

	serialize(){
		let map2obj = (map) => {
			let obj = {};
			for(let [k, v] of map) {
				obj[k] = v;
			}
			return obj;
		}

		for(var item of items){
			console.log(`${item[0]} -> ${item[1]}`);
			let filename = item[0].replace(/[:\\\/,.]/gi, "_");
			let fullpath = path.join(process.cwd(), './public/equip/model/' + filename + ".json");

			fs.writeFileSync(fullpath, JSON.stringify(map2obj(this.cache)), 'utf-8');
		}

		const jsonStr = (map) => {
			JSON.stringify(map2obj(map));
		}

		console.log(jsonStr);
	}

	deserialize(){

	}

}
	
	
util.inherits(equipments, events.EventEmitter)
module.exports = equipments
