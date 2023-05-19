/*global require,console,setInterval */
Error.stackTraceLimit = Infinity;

/*global require,setInterval,console */
const cities = [
	'London', 'Paris', 'New York', 'Moscow', 'Ho chi min', 'Benjing', 'Reykjavik', 'Nouakchott', 'Ushuaia', 'Longyearbyen'];

// const fs = require("fs");
// const key = fs.readFileSync("openweathermap.key");
// const unirest = require("unirest");
// async function getCityWeather(city) {
// 	const result = await new Promise((resolve) => {
// 		unirest.get(
// 			"https://community-open-weather-map.p.rapidapi.com/weather?id=2172797"
// 			+ "&units=metric"
// 			+ "&mode=json"
// 			+ `&q=${city}`)
// 			.header("X-RapidAPI-Host", "community-open-weather-map.p.rapidapi.com")
// 			.header("X-RapidAPI-Key", key)
// 			.end(
// 				(response) => resolve(response)
// 			);
// 	});
// 	if (result.status !== 200) {
// 		throw new Error("API error");
// 	}
// 	return result.body;
// }
// function unixEpoqToDate(unixDate) {
// 	const d = new Date(0);
// 	d.setUTCSeconds(unixDate);
// 	return d;
// }
// function extractUsefulData(data) {
// 	return {
// 		city: data.city,
// 		date: new Date(),
// 		observation_time: unixEpoqToDate(data.dt),
// 		temperature: data.main.temp,
// 		humidity: data.main.humidity,
// 		pressure: data.main.pressure,
// 		weather: data.weather[0].main
// 	};
// }
// const city_data_map = {};

// a infinite round-robin iterator over the city array
const next_city = ((arr) => {
	let counter = arr.length;
	return function () {
		counter += 1;
		if (counter >= arr.length) {
			counter = 0;
		}
		return arr[counter];
	};
})(cities);

async function update_city_data(city) {
	try {
		const data = await getCityWeather(city);
		city_data_map[city] = extractUsefulData(data);
	}
	catch (err) {
		console.log("error city", city, err);
		return;
	}
}

// make a API call every 10 seconds
const interval = 10 * 1000;
setInterval(async () => {
	const city = next_city();
	console.log("updating city =", city);
	await update_city_data(city);
}, interval);

const opcua = require("node-opcua");

function construct_my_address_space(server) {
	// declare some folders
	const addressSpace = server.engine.addressSpace;
	const namespace = addressSpace.getOwnNamespace();
	const objectsFolder = addressSpace.rootFolder.objects;
	const citiesNode = namespace.addFolder(objectsFolder, { browseName: "Cities" });
	for (let city_name of cities) {
		// declare the city node
		const cityNode = namespace.addFolder(citiesNode, { browseName: city_name });
		namespace.addVariable({
			componentOf: cityNode,
			browseName: "Temperature",
			nodeId: `s=${city_name}-Temperature`,
			dataType: "Double",
			value: { get: function () { return extract_value(opcua.DataType.Double, city_name, "temperature"); } }
		});
		namespace.addVariable({
			componentOf: cityNode,
			nodeId: `s=${city_name}-Humidity`,
			browseName: "Humidity",
			dataType: "Double",
			value: { get: function () { return extract_value(opcua.DataType.Double, city_name, "humidity"); } }
		});
		namespace.addVariable({
			componentOf: cityNode,
			nodeId: `s=${city_name}-Pressure`,
			browseName: "Pressure",
			dataType: "Double",
			value: { get: function () { return extract_value(opcua.DataType.Double, city_name, "pressure"); } }
		});
		namespace.addVariable({
			componentOf: cityNode,
			nodeId: `s=${city_name}-Weather`,
			browseName: "Weather",
			dataType: "String",
			value: { get: function () { return extract_value(opcua.DataType.String, city_name, "weather"); } }
		});
	}
}
function extract_value(dataType, city_name, property) {
	const city = city_data_map[city_name];
	if (!city) {
		return opcua.StatusCodes.BadDataUnavailable
	}
	const value = city[property];
	return new opcua.Variant({ dataType, value: value });
}

// Requiring module
var process = require('process')

// Prints the output as an object
console.log(process.memoryUsage())
// {
//   rss: 23851008,     
//   heapTotal: 4907008,
//   heapUsed: 2905912, 
//   external: 951886,  
//   arrayBuffers: 17574
// }

// Requiring module
var process = require('process')

// An example displaying the respective memory
// usages in megabytes(MB)
for (const [key, value] of Object.entries(process.memoryUsage())) {
	console.log(`Memory usage by ${key}, ${value / 1000000}MB `)
}

// Calling process.cpuUsage() method
const usage = process.cpuUsage();

// Printing returned value
console.log(usage);//{ user: 78000, system: 15000 }

let Kpis = ["rss", "heapTotal", "heapUsed", "external", "arrayBuffers", "user", "system"]
function present_kpi() {
	let result = {};
	let mem = process.memoryUsage();
	for (const [key, value] of Object.entries(mem)) {
		console.log(`Memory usage by ${key}, ${value / 1000000}MB `);
		result[`${key}`] = value / 1000000;
	}
	let cpu = process.cpuUsage();
	for (const [key, value] of Object.entries(cpu)) {
		console.log(`Memory usage by ${key}, ${value}? `);
		result[`${key}`] = value;
	}
	return result;
}
function construct_dynamic_space(server) {
	// declare some folders
	const addressSpace = server.engine.addressSpace;
	const namespace = addressSpace.getOwnNamespace();
	const objectsFolder = addressSpace.rootFolder.objects;
	const kpisNode = namespace.addFolder(objectsFolder, { browseName: "Kpi" });

	const snapshot = present_kpi();

	// declare the Kpi's node
	const curNode = namespace.addFolder(kpisNode, { browseName: "mem_cpu" });
	namespace.addVariable({
		componentOf: curNode,
		nodeId: `s=mem_cpu-rss`,
		browseName: "rss",
		dataType: "Double",
		value: { get: function () { return snapshot.rss; } }
	});
	namespace.addVariable({
		componentOf: curNode,
		nodeId: `s=mem_cpu-heapTotal`,
		browseName: "heapTotal",
		dataType: "Double",
		value: { get: function () { return snapshot.heapTotal; } }
	});
	namespace.addVariable({
		componentOf: curNode,
		nodeId: `s=mem_cpu-arrayBuffers`,
		browseName: "arrayBuffers",
		dataType: "Double",
		value: { get: function () { return snapshot.arrayBuffers; } }
	});
	namespace.addVariable({
		componentOf: curNode,
		nodeId: `s=mem_cpu-user`,
		browseName: "user",
		dataType: "Int",
		value: { get: function () { return snapshot.user; } }
	});
	namespace.addVariable({
		componentOf: curNode,
		nodeId: `s=mem_cpu-system`,
		browseName: "system",
		dataType: "String",
		value: { get: function () { return snapshot.system; } }
	});
}

(async () => {
	try {
		const server = new opcua.OPCUAServer({
			port: 4334, // the port of the listening socket of the servery
			buildInfo: {
				productName: "KpiStation",
				buildNumber: "7658",
				buildDate: new Date(2022, 12, 14),
			}
		});

		await server.initialize();

		construct_dynamic_space(server);

		await server.start();

		console.log("Server is now listening ... ( press CTRL+C to stop)");
		console.log("port ", server.endpoints[0].port);
		const endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
		console.log(" the primary server endpoint url is ", endpointUrl);
	}
	catch (err) {
		console.log("Error = ", err);
	}
})();

