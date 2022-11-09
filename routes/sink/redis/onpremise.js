let Redis = require('redis')
const client = Redis.createClient({
	host: '127.0.0.1',
	port: 6379
})
// export default client
// import client from './mqClient'

// 获取 Redis 中某个 key 的内容
export const getRedisValue = (key) => new Promise(resolve => client.get(key, (err, reply) => resolve(reply)))
// 设置 Redis 中某个 key 的内容
export const setRedisValue = (key, value) => new Promise(resolve => client.set(key, value, resolve))
// 删除 Redis 中某个 key 及其内容
export const delRedisKey = (key) => new Promise(resolve => client.del(key, resolve))


// subscribe redis upates
const redis = require('redis')
const subscriber = redis.createClient()
let callbackMap = new Map()

subscriber.on("message", (channel, message) => {
	console.log("@channel, Received data :", channel, message)
	for (var item of callbackMap) {
		console.log(item[0], ": ", item[1])
	}
})

module.exports = {
	regsub: function (topic, callback) {
		subscriber.subscribe(topic)
		callbackArray.set(client, callback)
	}
}

// publish
const publisher = redis.createClient()
module.exports = {
	pub: function (topic, message) {
		publisher.publish(topic, JSON.stringify(message))
	}
}

// input user name and his or her or hir role to retreive a group of views!