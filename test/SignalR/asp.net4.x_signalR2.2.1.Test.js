'use strict'
let expect = require('chai').expect
let signalr = require('node-signalr')
const fs = require('fs')
let log = (o) => { fs.appendFileSync(__filename + '.log', o + '\r\n', 'utf-8'); /**/console.log(o); }
let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe(__filename, function () {
  let hostname = 'desktop-eka5vdd'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  
  describe.skip('Labs desigoCC server: DESKTOP-EKA5VDD', function () {
    let request = require('supertest')
    let access_token = undefined    
  
    before((done) => {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
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
            console.log(util.inspect(results.error));
          }
          access_token = results.body.access_token;
          log(results.body);
          expect(access_token !== undefined, 'https sign-in !== null? ').to.be.true;
          done();
        })
        .catch(err => {
          log(err)
          console.error(err);
          done(err);
        })
    })

    /* setup environment variables like connection Id for subscription*/
    const { v4: uuidv4 } = require('uuid');
    let requestId = uuidv4();
    log(`requestId = ${requestId}`)
    let connectionId = undefined
    let client = undefined

    it(`cc: node-signalr single file module`, function (done) {
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
          done(ex)
        })

        client.on('connected', () => {
          console.log(client)

          connectionId = client.connection.id
          log(`connectionId = ${connectionId}`)

          client.connection.hub.on('norisHub', 'notifyValues', (message) => {
            log('notifyValues:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifyEvents', (message) => {
            log('notifyEvents:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifySubscriptionStatus', (message) => {
            log('notifySubscriptionStatus:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifyEventCounters', (message) => {
            log('notifyEventCounters:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifySuppressedObjects', (message) => {
            log('notifySuppressedObjects:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifySuppressedObjectsSubscription', (message) => {
            log('notifySuppressedObjectsSubscription:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifySystemBrowserChanges', (message) => {
            log('notifySystemBrowserChanges:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifyCommands', (message) => {
            log('notifyCommands:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifySounds', (message) => {
            log('notifySounds:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifySystems', (message) => {
            log('notifySystems:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifyAccessRights', (message) => {
            log('notifyAccessRights:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifyOperatingProcedures', (message) => {
            log('notifyOperatingProcedures:' + JSON.stringify(message))
          })

          client.connection.hub.on('norisHub', 'notifyMessage', (message) => {
            log('notifyMessage:' + JSON.stringify(message))
          })

          setTimeout(() => {
            done();
          }, 6000)

        })
        client.start()
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: eventssubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/eventssubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6\"]")//
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, 'https eventssubscriptions !== null? ').to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: valuessubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/valuessubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/valuessubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: eventcounterssubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/eventcounterssubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/eventcounterssubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: SystemBrowserSubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/SystemBrowserSubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/SystemBrowserSubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: systemssubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/systemssubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/systemssubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: eventcategorysoundssubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/eventcategorysoundssubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/eventcategorysoundssubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: accessrightssubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/accessrightssubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/accessrightssubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: operatingproceduressubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/operatingproceduressubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/operatingproceduressubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })

    it(`Channelized: commandssubscriptions`, function (done) {
      if (access_token !== undefined) {
        request(`https://${hostname}:8443`)
          .post(`/api/sr/commandssubscriptions/channelize/${requestId}/${connectionId}`)
          .set('Access-Control-Allow-Origin', '*')
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${access_token}`)
          .send("[\"System1:GmsDevice_1_7210_16777222.Present_Value\",\"System1:GmsDevice_1_7211_6.Present_Value\"]")
          .expect(200)
          .end(function (err, res) {
            if (err) {
              done(err)
            } else {
              log(res.body)
              expect(res.body !== undefined, `/api/sr/commandssubscriptions/channelize/${requestId}/${connectionId}`).to.be.true;
              done();
            }
          })
      } else {
        done('Error: access_token is empty!')
      }
    })
    
    after(() => {
      if (client) {
      }      
    })



  })
})