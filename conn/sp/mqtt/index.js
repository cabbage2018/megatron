'use strict'

//https://github.com/mqttjs/MQTT.js/#install
const mqtt = require('mqtt')
const client  = mqtt.connect('mqtt://test.mosquitto.org')

client.on('connect', function () {
  client.subscribe('/my/topic', function (err) {
    if (!err) {
      client.publish('/my/topic', 'Hello mqtt')
    }
  })
})

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  client.end()
})