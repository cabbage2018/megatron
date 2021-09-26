'use strict'
let expect = require('chai').expect
let log4js = require('log4js')
log4js.configure({
  appenders: {
    stdout: {
      type: 'stdout',
    }, 
    access: {
      type: 'dateFile',
      filename: './logs/access',
      pattern: 'yyyy-MM-dd_access.txt',
      alwaysIncludePattern: true,
    },
    other: {
      type: 'file',
      maxLogSize: 8388608/4,
      backups: 2,
      compress : true,
      keepFileExt : false,
      filename: './logs/output.txt',
      alwaysIncludePattern: true,
    },
  },
  categories: {
    default: { appenders: ['stdout', 'access', 'other'], level: 'all' },
    access: { appenders: ['stdout'], level: 'debug' }
  }
})
let log = log4js.getLogger('redis.labratoryServer.pubsub.Channel.Test')
let redis = require('redis')

describe(__filename, function () {
  const redisConfig = {
    url: 'redis://requirepass:123456@10.0.0.7:6379'
  }
  describe('flood test in Intranet,', function () {
    
    let subscriber = redis.createClient(6379, '10.0.0.7')//, {/**/auth_pass: '123456'}
    let publisher = redis.createClient(6379, '10.0.0.7')
    subscriber.auth('123456',function(){
      console.log('subscriber通过认证')
    })
    publisher.auth('123456',function(){
      console.log('publisher通过认证')
    })

    before((done) => {
      subscriber.on("message", function(channel, message){
        console.log(`redis event: on message, channel${channel}, message:${message}`)
      })
      subscriber.subscribe('desigocc-datapoints')
      subscriber.subscribe('desigocc')
      done()

    })

    let count = 0    
    it(`laboratory server`, /**/async function (done) {
      let task = setInterval(()=>{
        count ++
        let obj = {t: new Date(), v: Math.random()*65535, b: Math.random() > 0.5? true: false }
        publisher.publish('desigocc-datapoints', `${count}`)
        publisher.publish('desigocc', `${JSON.stringify(obj)}`)

        if(count > 100){
          clearInterval(task)
          subscriber.unsubscribe('desigocc')
          subscriber.unsubscribe('desigocc-datapoints')
          subscriber.quit()
          publisher.quit()
          // done('time is out')
        }
      },1000 )

      done()
    })

    after(() => {
      // subscriber.quit()
      // publisher.quit()
    })
  })
})