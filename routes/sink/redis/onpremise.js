'use strict'
// subscribe redis upates
const Redis = require('redis')
const client = Redis.createClient({
	host: '127.0.0.1',
	port: 6379
})

// 获取 Redis 中某个 key 的内容
export const getRedisValue = (key) => new Promise(resolve => client.get(key, (err, reply) => resolve(reply)))
// 设置 Redis 中某个 key 的内容
export const setRedisValue = (key, value) => new Promise(resolve => client.set(key, value, resolve))
// 删除 Redis 中某个 key 及其内容
export const delRedisKey = (key) => new Promise(resolve => client.del(key, resolve))

const subscriber = Redis.createClient()
let callbackMap = new Map()
subscriber.on("message", (channel, message) => {
	console.log(`${message} << ${channel}`)
})
function subRedis(topic, callback) {
	subscriber.subscribe(topic)
}
// publish
function pub(topic, message) {
	publisher.publish(topic, JSON.stringify(message))
}
// input user name and his or her or hir role to retreive a group of views!