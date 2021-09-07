const redis = require("redis")
const options = {
  host: "127.0.0.1",
  port: 6379,
  password: "123456"
}
const localhub = redis.createClient()
localhub.on("error", function(error) {
  console.error(error);
});
localhub.on("subscribe", (channel, count) => {
  console.log("Subscribe # subscribed to " + channel + ", " + count + " total subscriptions");
});
localhub.on('message', function(channel, message) {
  console.error('on receiving:' + channel + 'message:' + message.toString())
})
localhub.on('unsubscribe', (channel, count) => {
  console.log("Unsubscribe # to " + channel + ", " + count + " total subscriptions");
});
localhub.set("key", "value", redis.print);
localhub.get("key", redis.print);///?
localhub.publish("pubsub", JSON.stringify({"key": "value 100"}))
localhub.on('connect', () => {
  console.log('Redis is connected!')
  handleTask({h: new Date()})
})
localhub.subscribe('webchat'); //订阅信道
setTimeout(() => {
  localhub.unsubscribe('webchat'); //延时取消信道订阅
}, 60000)
setTimeout(() => {
  localhub.quit();//关闭连接
}, 60000)
module.exports = {
  pub: function(topic, message){
    if(localhub !== null && localhub !== undefined){
      localhub.publish(topic, JSON.stringify(message))
    }
  },
  handle: async function handle() {
    let task = {}
    await handleTask(task)
  }
}
// let callbackMap = new Map()
// callbackMap.set("default", (channel, message)=>{
//     console.log(channel, message)
//     // process.exit(1)
// })
// for(var item of callbackMap){
//   console.log(item[0], item[1])
//   // item[1](channel, message)
// }
function handleTask(task) {
  return new Promise((resolve) => {
    setTimeout(async () => {
      localhub.publish("webchat", `JSON.stringify(...) ${task}`, ()=>{console.log("publish finish?" + task)})
      // console.log(`Handling task: ${task}...`)
      resolve()
    }, 3000)
  })
}

function singleSynchronize(){
  return new Promise((resolve,reject)=>{
    let client = redis.createClient(6379, "127.0.0.1")
    client.on('connect', function() {
      resolve("redis connected");
    });

    var request = https.request(options, function(response){        
      var responseBuffer = "";
      response.on('data', function(respbody){
        responseBuffer += respbody.toString();
      });
        response.on('end',()=>{
      });
    });
    request.on('error', (error) => {
        reject(error)
    })
  })
}

function httpsSynchronize(body, options) {
  return new Promise((resolve,reject)=>{
      var request = https.request(options, function(response){
        var responseBuffer = "";
        response.on('data', function(respbody){
            responseBuffer += respbody.toString();
        });
        response.on('end',()=>{
            resolve(responseBuffer);
        });
      });
      request.on('error', (error) => {
        tracer.warn(error)
        reject(error)
      })
      request.write(body)
      request.end()
  })
}
module.exports = {acquire}