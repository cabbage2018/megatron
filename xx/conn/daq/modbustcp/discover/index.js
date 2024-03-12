'use strict'
// 引入 events 模块
const events = require('events');
// 创建 eventEmitter 对象
const eventEmitter = new events.EventEmitter();
eventEmitter.on('patternReceivedEvent', function (arg1, arg2) {
	console.log('listener1', arg1, arg2);
});
eventEmitter.on('patternReceivedEvent', function (arg1, arg2) {
	console.log('listener2', arg1, arg2);
});
eventEmitter.emit('patternReceivedEvent', 'arg1 参数', 'arg2 参数');
setTimeout(function () {
	eventEmitter.emit('patternReceivedEvent', 'arg3 参数', 'arg4 参数');
}, 6000);

let listener = require('./listener')
///listen on another port before sending
// 'use strict'
let broadcast = require('./broadcast')