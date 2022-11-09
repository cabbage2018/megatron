'use strict'
var mqtt = require('mqtt');
var EventEmitter = require('events');
var EventEmitter = require('events');

//---
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function createGuid() {
  var id = 1;
  return function () {
    return String(id++);
  };
}

function createDebug(mod) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var debugMod = process.env.DEBUG;
    if (debugMod && (debugMod === '*' || mod.indexOf(debugMod) > -1)) {
      var _console;

      var _args = [mod + ':'].concat(args);
      (_console = console).log.apply(_console, _toConsumableArray(_args));
    }
  };
}

function getIP() {
  var ifaces = os.networkInterfaces();
  var ip = "";
  for (var dev in ifaces) {
    ifaces[dev].forEach(function (details) {
      if (details.family == 'IPv4' && dev === 'en0') {
        ip = details.address;
      }
    });
  }
  return ip;
}

function isJsonString(str) {
  try {
    if (_typeof(JSON.parse(str)) == "object") {
      return true;
    }
  } catch (e) {}
  return false;
}

function mqttMatch(filter, topic) {
  var filterArray = filter.split('/');
  var length = filterArray.length;
  var topicArray = topic.split('/');
  for (var i = 0; i < length; ++i) {
    var left = filterArray[i];
    var right = topicArray[i];
    if (left === '#') return topicArray.length >= length - 1;
    if (left !== '+' && left !== right) return false;
  }
  return length === topicArray.length;
}

function mqttNotMatch(filter, topic) {
  return !mqttMatch(filter, topic);
}

var debug = createDebug('device');
var guid = createGuid();
var packagejson = require('../package.json');
var nilFn = function nilFn() {};


//---
var Thing = function (_EventEmitter) {
  _inherits(Thing, _EventEmitter);

  function Thing() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var mqttClient = arguments[1];
    var type = arguments[2];

    _classCallCheck(this, Thing);

    // 设备类型:device,subdevice,gateway
    var _this = _possibleConstructorReturn(this, (Thing.__proto__ || Object.getPrototypeOf(Thing)).call(this));

    _this._type = _this.constructor.name || "UNKNOW";
    // console.log("thing type:",this._type);

    _this.serveCB = [];
    _this.localCB = [];

    // _this._onShadowCB = nilFn;
    //兼容旧版本
    _this._compatibleoverdue();
    return _this;
  }

  // 发布消息到topic

  _createClass(Thing, [{
    key: 'publish',
    value: function publish() {
      var _mqttClient;

      (_mqttClient = this._mqttClient).publish.apply(_mqttClient, arguments);
    }
    // 订阅消息

  }, {
    key: 'subscribe',
    value: function subscribe() {
      var _mqttClient2;

      (_mqttClient2 = this._mqttClient).subscribe.apply(_mqttClient2, arguments);
    }
    // 取消订阅消息

  }, {
    key: 'unsubscribe',
    value: function unsubscribe() {
      var _mqttClient3;

      (_mqttClient3 = this._mqttClient).unsubscribe.apply(_mqttClient3, arguments);
    }
  }, {
    key: 'end',
    value: function end() {
      var _mqttClient4;

      (_mqttClient4 = this._mqttClient).end.apply(_mqttClient4, arguments);
    }

    // 属性快捷获取

  },{
    key: '_subscribeClientEvent',
    value: function _subscribeClientEvent() {
      var _this3 = this;

      var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._mqttClient;

      ['connect', 'error', 'close', 'reconnect', 'offline', 'message'].forEach(function (evtName) {
        _this3._mqttClient.on(evtName, function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          debug('mqtt client ' + evtName);
          if (evtName === 'connect') {
            debug('mqtt connected');
            _this3._subscribePresetTopic();
          }
          // 事件流到设备端开发者lib中的方式有2中，通过subscribe和通过callback
          if (evtName === 'message') {
            // 1：处理subscribe通知
            _this3.emit.apply(_this3, [evtName].concat(args));
            // 2：处理callback通知
            _this3._mqttCallbackHandler.apply(_this3, args);
            return;
          }
          if (evtName === 'close') {}
          // console.log("on close");

          // 其他事件 'connect', 'error', 'close', 'reconnect', 'offline'处理
          _this3.emit(evtName, args);
        });
      });
    }
  },{
    key: '_createClient',
    value: function _createClient() {
      this._mqttClient = mqtt.connect(this.model.brokerUrl, this.model.genConnectPrarms());
    }
  },{
    key: '_subscribePresetTopic',
    value: function _subscribePresetTopic() {
      var _this4 = this;

      var thing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this;

      //初始化只需要订阅 属性返回的topic和标签删除返回的topic，事件topic需要跟进event动态订阅，所以初始化不需要订阅
      [
      // "/sys/#",
      // "/shadow/#",
      // "/ext/#"
      // devices
      thing.model.POST_PROPS_REPLY_TOPIC, thing.model.ONSET_PROPS_TOPIC, thing.model.getWildcardEvenTopic(), thing.model.TAG_REPLY_TOPIC, thing.model.TAG_DELETE_REPLY_TOPIC, thing.model.CONFIG_REPLY_TOPIC, thing.model.SHADOW_SUBSCRIBE_TOPIC, thing.model.CONFIG_SUBSCRIBE_TOPIC, thing.model.CONFIG_SUBSCRIBE_RESP_TOPIC,
      // gateway
      thing.model.ADD_TOPO_REPLY_TOPIC, thing.model.DELETE_TOPO_REPLY_TOPIC, thing.model.GET_TOPO_REPLY_TOPIC, thing.model.LOGIN_REPLY_TOPIC, thing.model.LOGOUT_REPLY_TOPIC, thing.model.SUBDEVICE_REGISTER_REPLY_TOPIC, thing.model.RRPC_REQ_TOPIC].forEach(function (replyTopic) {
        // console.log("subscribe topic>>>>>>", replyTopic);
        _this4.subscribe(replyTopic, {
          "qos": 1
        }, function (error, res) {
          // console.log(">>>>>> subscribe topic resp",error,res);
          if (error) {
            debug('sub error:', error.toString);
          }
        });
      });
    }
    // 处理内部message以及各种方法的回调

  },{
    key: '_mqttCallbackHandler',
    value: function _mqttCallbackHandler(topic, message) {
      // console.log('device _mqttCallbackHandler',topic,message);
      // console.log('message',JSON.parse(message.toString()));
      // console.log('topic',topic);

      // 几种不处理的情况
      // 情况1:回调函数为空
      if (this._cb == [] && this._serviceCB == [] && this._onShadowCB == nilFn && this._onConfigCB == nilFn) {
        return;
      }
      // 情况2:返回值为非结构化数据（非结构化可能是：基础版产品或是用户自定义topic）
      if (isJsonString(message.toString()) == false) {
        return;
      }
      // 开始处理返回值
      try {
        var res = JSON.parse(message.toString());

        //处理On Props Set回调
        // topic /sys/<pk>/<dn>/thing/service/property/set
        if (mqttMatch(this.model.ONSET_PROPS_TOPIC, topic)) {
          this._onPropsCB(res);
          return;
        }

        //处理物模型服务订阅返回数据,同步或者异步方式
        if ((mqttMatch(this.model.getWildcardServiceTopic(), topic) || mqttMatch(this.model.RRPC_REQ_TOPIC, topic)) && this._onReceiveService != undefined) {
          // console.log("device  mqttMatch(this.model.getWildcardServiceTopic");
          this._onReceiveService(topic, res);
          return;
        }
        // 影子设备reply和云端或应用下发影子配置通知,很久之前cmp定义的方法名称，所以格式与其他名称不太相同
        if (mqttMatch(this.model.SHADOW_SUBSCRIBE_TOPIC, topic) && this._onShadowCB != nilFn) {
          this._onShadowCB(res);
          return;
        }
        // 远程配置回调
        if (mqttMatch(this.model.getWildcardConfigTopic(), topic) && mqttNotMatch(this.model.CONFIG_REPLY_TOPIC, topic) && this._onConfigCB != undefined) {
          this._onConfigCB(res);
          return;
        }
        //其他通用回调
        var cbID = res.id;

        var callback = this._findCallback(cbID, topic);
        if (callback) {
          callback(res);
        }
      } catch (e) {
        // console.log('_mqttCallbackHandler error',e)
      }
    }
  },{
    key: '_findCallback',
    value: function _findCallback(cbID, topic) {
      var separator = '|exp-topic|';
      var msgTopic = cbID.split(separator)[1];
      if (msgTopic && msgTopic != topic) {
        return;
      }
      // 查找回调函数,找到后删除
      var cb = this._getCallbackById(cbID);
      delete this._cb[cbID];
      return cb;

      // if(cbID.indexOf(separator)>0 ){
      //   console.log("cbID>>>>:",cbID);
      //   console.log("cbID.split",cbID.split(separator)[1]);
      //   if(cbID.split(separator)[1] != topic){
      //     return;
      //   }
      // }
    }
    // // 查找回调函数,找到后使
    // _popCallback(cbID) {
    //   const cb = this._getCallbackById(cbID);
    //   delete this._cb[cbID];
    //   return cb;
    // }

  }, {
    key: 'mqttClient',
    get: function get() {
      return this._mqttClient;
    }
  }]);

  return Thing;
}(EventEmitter);


//---
var Device = function (_Thing) {
  _inherits(Device, _Thing);

  function Device() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Device);

    // create mqttclient
    var _this = _possibleConstructorReturn(this, (Device.__proto__ || Object.getPrototypeOf(Device)).call(this, config));

    _this._createClient(_this.model);
    // subcribe client event and preset topic
    _this._subscribeClientEvent();
    return _this;
  }

  return Device;
}(Thing);


module.exports = Device;
/*
{
  device: function device(config) {
    var Device2 = Device;
    return new Device2(config);
  },
  sdkver: _package2.default.version
};
*/