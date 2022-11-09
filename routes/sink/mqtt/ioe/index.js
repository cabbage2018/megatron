/**
"dependencies": { "mqtt": "2.18.8" }
*/
const mqtt = require('mqtt');
const log4js = require('log4js')
const log = log4js.getLogger('cloud::ioe::index')
const options = require("../../../public/connectivity/options_ioe").options;
const url = require("../../../public/connectivity/options_ioe").url;
let client = mqtt.connect(url, options)
const topic = "timeseries"

client.on('connect', function () {
	log.debug('----------------------------IOE MQTT conn ACK!----------------------------')
	client.subscribe(topic)
})
client.on('error', function (err) {
	log.debug(err)
	client.end()
})
client.on('message', function (topic, message) {
	// log.debug(topic, message)
})
setInterval(function () {
	try {
		client.publish(topic, __filename)
	} catch (error) {
		log.debug('on publish error:', error)
	}
}, 600 * 1000);

module.exports = {
	remote: client
}