'use strict'
let log4js = require('log4js')
let logger = log4js.getLogger('routes::northbound::cloud::aliyun')
let mqtt = require('mqtt')
const crypto = require('crypto');

const _virtualAssetDescription = require('./iothubDeviceDescription')

const predefinedTopic = '/' + _virtualAssetDescription.ProductKey + '/' + _virtualAssetDescription.DeviceName + '/user/update'
var productKey = _virtualAssetDescription.ProductKey
var deviceName = _virtualAssetDescription.DeviceName
var deviceSecret = _virtualAssetDescription.DeviceSecret
    
//设备身份三元组+区域
const deviceConfig = {
    productKey: productKey,
    deviceName: deviceName,
    deviceSecret: deviceSecret,
    regionId: "cn-shanghai"
};

const params = {
    productKey: deviceConfig.productKey,
    deviceName: deviceConfig.deviceName,
    timestamp: Date.now(),
    clientId: `${deviceConfig.productKey}&${deviceConfig.deviceName}` ///Math.random().toString(36).substr(2)
}

//CONNECT参数
const options = {
    keepalive: 300, //300s
    clean: false,  //cleanSession ->保持持久会话
    tls: true,
    protocolVersion: 4 //>= MQTT v3.1.1
}

//1.生成clientId，username，password
options.password = signHmacSha1(params, deviceConfig.deviceSecret);
options.clientId = `${params.clientId}|securemode=3,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
options.username = `${params.deviceName}&${params.productKey}`;
var url = `mqtt://${deviceConfig.productKey}.iot-as-mqtt.${deviceConfig.regionId}.aliyuncs.com:1883`;
// url = "mqtt://47.103.190.106:1883"

//2.建立连接
const client = mqtt.connect(url, options);

//3.属性数据上报
const topic = `/${deviceConfig.productKey}/${deviceConfig.deviceName}/user/update`

client.on('connect', function() {
    logger.debug('----------------------------MQTT conn ACK!----------------------------')
    // client.subscribe(topic)
})

setInterval(function() {
    var payload = getPostData()
    try{
        client.publish(predefinedTopic, payload)
    } catch (error) {
        logger.debug('on publish error:', error)
    }
}, 120 * 1000);

client.on('error', function(err) {
    logger.debug('mqtt connect #', err)
    client.end()
})

client.on('message', function(topic, message) {
    logger.debug('on receiving:' + topic + 'message:' + message.toString())
})

//模拟数据
function getPostData(){    
    const payloadJson = {        
        id: Date.now(),
        params: {
            temperature: Math.floor((Math.random() * 20) + 10),
            humidity: Math.floor((Math.random() * 20) + 60)
        },
        method: "thing.event.property.post"
    }
    return JSON.stringify(payloadJson);
}

/*
  生成基于HmacSha1的password
  参考文档：https://help.aliyun.com/document_detail/73742.html?#h2-url-1
*/
function signHmacSha1(params, deviceSecret) {
    let keys = Object.keys(params).sort();
    // 按字典序排序
    keys = keys.sort();
    const list = [];
    keys.map((key) => {
        list.push(`${key}${params[key]}`);
    });
    const contentStr = list.join('');
    return crypto.createHmac('sha1', deviceSecret).update(contentStr).digest('hex');
}

module.exports = {
  remote: client
}