let log4js = require('log4js')
let tracer = log4js.getLogger('routes::northbound::ecs')
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const mqtt = require('mqtt')
const options = require("../../../public/connectivity/options_ecs").options
const url = require("../../../public/connectivity/options_ecs").url
let client = mqtt.connect(url, options)

client.on('report', function(){
    tracer.debug('report: ', report)
})
client.on('error', function(err) {
    tracer.error('mqtt connect #', err)
    client.end()
})
client.on('message', function(topic, message) {
    tracer.debug('on receiving:' + topic + 'message:' + message.toString())
})
client.on('connect', function() {
    
    
    
    tracer.debug('----------------------------ECS MQTT conn ACK!----------------------------')



    client.subscribe("/gw")
})

setInterval(function() {
    try{
        
        if (client.connected === true){
            client.publish("/gw", JSON.stringify({_t: new Date().toISOString()}))
        }

        client.publish("timeseries", JSON.stringify({_t: new Date().toISOString()}))
    } catch (error) {

        if (client.connected === true){
            client.publish("/gw", JSON.stringify({_t: new Date().toISOString()}))
        }
        
        
        tracer.error('on publish error:', error)
    }
}, 150 * 1000)

module.exports={
    remote: client
}