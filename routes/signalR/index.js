'use strict'
var express = require('express');
var router = express.Router();
const mqtt = require('mqtt')
const redis = require("redis")
let signalr = require('node-signalr')
let request = require('supertest')

let path = require('path')
let fs = require('fs')

let log4js = require('log4js')
let log = log4js.getLogger('routes::signalR::index')

/*
  redis; for channel information changes
*/
let options = {
  host: "127.0.0.1",
  port: 6379,
  password: "123456"
}
if(fs.existsSync(path.join(process.cwd(), '/config/signalroptions.json'))){
  options = JSON.parse(fs.readFileSync(path.join(process.cwd(), '/config/signalroptions.json')))
}

const localhub = redis.createClient(options)
localhub.auth('123456');  // 如果没有设置密码 是不需要这一步的
// localhub.lpush()
// localhub.lrange()
localhub.on("error", function(error) {
  log.error(`${error.message}`)
  console.error(error);
});
localhub.on("subscribe", (channel, count) => {
  log.debug("Subscribe # subscribed to " + channel + ", " + count + " total subscriptions");
});
localhub.on('message', function(channel, message) {
  log.debug('on receiving:' + channel + 'message:' + message.toString())
})
localhub.on('unsubscribe', (channel, count) => {
  log.info("Unsubscribe # to " + channel + ", " + count + " total subscriptions");
});
localhub.set("key", "value", redis.print);
localhub.get("key", redis.print);///?
localhub.publish("pubsub", JSON.stringify({"key": "value 100"}))

localhub.on('connect', () => {
  log.debug('Redis is connected!')
})
localhub.subscribe('webchat'); //订阅信道
setTimeout(() => {
  localhub.unsubscribe('webchat'); //延时取消信道订阅
}, 60000)
setTimeout(() => {
  localhub.quit();//关闭连接
}, 60000)



/*
  1
  mqtts; called by signalR on message arriving
*/
let target_mqtts = options.mqtt[0]
let target = mqtt.connect(target_mqtts.endpointUrl, target_mqtts.options)
target.on('error', function (err) {
  log.error('mqtt client connect #', err.message)
  target.end()
})
target.on('message', function (topic, message) {
  log.debug(`MQTTs recv: ${topic}, message=${message}`)
  setTimeout(() => {
    target.unsubscribe('#')
  }, 15000)
})
target.on('connect', function () {
  //sub
  target.subscribe('#')
  //pub
  target.publish('cc/values', JSON.stringify(target), (err)=>{
    log.error('mqtt publish #', err.message)
  })
  log.warn('mqtt connected successfully')
})
/*
  signalR; to subscribe desigo cc message
*/
let hostname = 'desktop-eka5vdd'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
let access_token = undefined
request(`https://${hostname}:8443`)
  .post('/api/token')
  .set('Content-Type', 'application/x-www-form-urlencoded')
  .set('Access-Control-Allow-Origin', '*')
  .send('grant_type=password&username=xx&password=**')
  .expect(200)
  .then(results => {
    if (results.error !== null
      && typeof results.error !== 'undefined'
      && results.error !== false) {
      console.log(util.inspect(results.error))
    }
    access_token = results.body.access_token
    log(results.body)
  })
  .catch(err => {
    log.fatal(err)
  })

const { v4: uuidv4 } = require('uuid');
let requestId = uuidv4();
log.mark(`requestId = ${requestId}`)
let connectionId = undefined
let client = undefined

if (access_token !== undefined) {
  let signalrUrl = `https://${hostname}:8443/signalr`
  client = new signalr.client(signalrUrl, ['norisHub'])
  client.headers['Authorization'] = `Bearer ${access_token}`

  // set timeout for sending message 
  client.callTimeout = 15000 
  // set delay time for reconecting
  client.reconnectDelayTime = 8000 
  // set timeout for connect 
  client.requestTimeout = 5000 

  client.on('reconnecting', (count) => {
    console.log(`SignalR client reconnecting(${count}).`)
  })
  client.on('disconnected', (code) => {
    console.log(`SignalR client disconnected(${code}).`);
  })
  client.on('error', (code, ex) => {
    console.log(`SignalR client connect error: ${code}. ex: ${ex}`)
  })
  client.on('connected', () => {
    console.log(client)
    connectionId = client.connection.id
    log.warn(`connectionId = ${connectionId}`)

    client.connection.hub.on('norisHub', 'notifyValues', (message) => {
      log.warn('notifyValues:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifyEvents', (message) => {
      log.warn('notifyEvents:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifySubscriptionStatus', (message) => {
      log.warn('notifySubscriptionStatus:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifyEventCounters', (message) => {
      log.warn('notifyEventCounters:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifySuppressedObjects', (message) => {
      log.warn('notifySuppressedObjects:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifySuppressedObjectsSubscription', (message) => {
      log.warn('notifySuppressedObjectsSubscription:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifySystemBrowserChanges', (message) => {
      log.warn('notifySystemBrowserChanges:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifyCommands', (message) => {
      log.warn('notifyCommands:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifySounds', (message) => {
      log.warn('notifySounds:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifySystems', (message) => {
      log.warn('notifySystems:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifyAccessRights', (message) => {
      log.warn('notifyAccessRights:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifyOperatingProcedures', (message) => {
      log.warn('notifyOperatingProcedures:' + JSON.stringify(message))
    })

    client.connection.hub.on('norisHub', 'notifyMessage', (message) => {
      log.warn('notifyMessage:' + JSON.stringify(message))
    })

    setTimeout(() => {
      console.log(`signalr is connected, subscribed`)
    }, 6000)

  })
  client.start()
} else {
  log.warn('Error: access_token is empty!')
}

if (access_token !== undefined) {
  log.info()
  request(`https://${hostname}:8443`)
    .post(`/api/sr/eventssubscriptions/channelize/${requestId}/${connectionId}`)
    .set('Access-Control-Allow-Origin', '*')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${access_token}`)
    .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6\"]")
    .expect(200)
    .end(function (err, res) {
      if (err) {
        log.warn(err)
      } else {
        console.log(res.body)
      }
    })
} else {
  log.warn('Error: access_token is empty!')
}

let channelized = []
module.exports = {
  appendChannel: function(arrayChannel){    
    channelized.join(arrayChannel)
    let content = JSON.stringify(arrayChannel).trim()
    console.log(content)
    if(client){

      if (access_token !== undefined) {
        log.info(`${channelized}`)

        request(`https://${hostname}:8443`)
          .post(`/api/sr/eventssubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send(content)///"[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6\"]"
          .expect(200)
          .end(function (err, res) {
            if (err) {
              log.error(err)
            } else {
              console.log(res.body)
            }
          })
      } else {
        log.warn('Error: access_token is empty!')
      }

    }
  },
  display: async function display() {
    console.log(channelized)
  }
}

/* GET web page. */
router.get('/', function(req, res, next) {
  let arr = JSON.parse(JSON.stringify(channelized))
  res.render('list', {
    title: __filename + new Date().toISOString(),
    items: arr
  })
})

module.exports = router