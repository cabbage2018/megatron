/**
"dependencies": { "mqtt": "2.18.8" }
*/
const mqtt = require('mqtt');

const log4js = require('log4js')
const tracer = log4js.getLogger('cloud::ioe::index')

const options = require("../../../public/connectivity/options_ioe").options;
const url = require("../../../public/connectivity/options_ioe").url;

let client = mqtt.connect(url, options)
const topic = "timeseries"

client.on('connect', function() {
    tracer.debug('----------------------------IOE MQTT conn ACK!----------------------------')
    client.subscribe(topic)
})
client.on('error', function(err) {
    tracer.debug(err)
    client.end()
})

client.on('message', function(topic, message) {
    // tracer.debug(topic, message)
})

setInterval(function() {
    try{
        client.publish(topic, __filename)
    } catch (error) {
        tracer.debug('on publish error:', error)
    }
}, 600 * 1000);

module.exports={
    remote: client
}