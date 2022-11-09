const log4js = require('log4js')
const logger = log4js.getLogger('cloud:hub')

/**
"dependencies": { "mqtt": "3.1.1" }
*/
const crypto = require('crypto');
const mqtt = require('mqtt');

const _virtualAssetDescription = require('../config/iothubDeviceDescription')
const predefinedTopic = '/' + _virtualAssetDescription.ProductKey + '/' + _virtualAssetDescription.DeviceName + '/user/update'
  var productKey = _virtualAssetDescription.ProductKey
  var deviceName = _virtualAssetDescription.DeviceName
  var clientId = Math.random().toString(16).substr(2, 8); //自id
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
    keepalive:300, //60s
    clean:false,  //cleanSession保持持久会话
    tls:false,
    protocolVersion: 4 //MQTT v3.1.1
}

//1.生成clientId，username，password
options.password = signHmacSha1(params, deviceConfig.deviceSecret);
options.clientId = `${params.clientId}|securemode=3,signmethod=hmacsha1,timestamp=${params.timestamp}|`;
options.username = `${params.deviceName}&${params.productKey}`;

var url = `mqtt://${deviceConfig.productKey}.iot-as-mqtt.${deviceConfig.regionId}.aliyuncs.com:1883`;
url = "mqtt://47.103.190.106:1883"
//url = 'test.mosquitto.org:1883'
logger.debug(url, options)

//2.建立连接
const client = mqtt.connect(url, options);


//3.属性数据上报
// const topic = `/sys/${deviceConfig.productKey}/${deviceConfig.deviceName}/thing/event/property/post`;
const topic = `/${deviceConfig.productKey}/${deviceConfig.deviceName}/user/update`

client.on('connect', function() {
    logger.debug('MQTT conn ACK!--------------------------------------------------------')
    // client.subscribe(`/${productKey}/${deviceName}/send_push`)
    
    setInterval(function() {
        //发布数据到topic
        var payload = getPostData()
        client.publish(predefinedTopic, payload)
        logger.debug('on publish:' + predefinedTopic + 'message:' + payload.toString())

    }, 30 * 1000);

})

client.on('error', function(err) {
    logger.debug('mqtt connect #', err)
	client.end()
})

//topic
client.on('message', function(topic, message) {

    // message is Buffer
    logger.debug('on receiving:' + topic + 'message:' + message.toString())
	
	  for (var action_ in actlist) {
		action_(topic, message)
	  }

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
*/function signHmacSha1(params, deviceSecret) {

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



//
//
//
var actlist = [];
var subscribe = (t, cb)=>{
  actlist.push(cb)
}
var publish = (m)=>{

    if(client){
        
        client.publish(predefinedTopic, m)
        logger.debug('on publish:>>>>>>>>>>>>>>>>' + predefinedTopic + ', message:' + m)

    }
}


module.exports._device = client
module.exports.subscribe = subscribe
module.exports.publish = publish


