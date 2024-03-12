'use strict'
let cron = require('node-cron')
let path = require('path')
let fs = require('fs')
let measureDic = new Map();
let tariffDic = new Map();

const { modbustcp } = require('../conn/daq/modbustcp');

//tariff

    // Callendar-aligned task, most repeat every 15min 
    let quarterlyReport = cron.schedule('0 */15 * * * *', async () => {
        try {

            let remote1 = new modbustcp({ip: "127.0.0.1", port: 502, slave: 127});
            remote1.connect();
            remote1.commissioning({})
            .then(function(response){
                console.log(response);
            })
            .catch(function(error){
                console.log(error);
            });

            for (let i of tariffDic) {
                let entry = i[0];
                let arr = i[1];
                let split = entry.split(':');
                let host = split[0];
                let port = parseInt(split[1]);
                let subnum = parseInt(split[2]);
                for (let j = 0; j < arr.length; j++) {
                    let phys = arr[j];
                    let fc = phys.fc
                    let register = phys.register
                    let quantity = phys.quantity
                    let timeout = phys.timeout
                    await acquire(host, port, subnum, fc, register, quantity, timeout)
                        .then((resp) => {
                            log.mark(resp);
                        })
                        .catch((err) => {
                            log.error(err);
                        });
                }
            }
        } catch (error) {
            logger.debug('-->', error)
        }
        console.log('::-', new Date())
    })
    quarterlyReport.start();

//measure
		// Cyclic
		intervalTask = setInterval(async function () {
			try {
				for (let i of measureDic) {
					let entry = i[0];
					let arr = i[1];
					let split = entry.split(':');
					let host = split[0];
					let port = parseInt(split[1]);
					let subnum = parseInt(split[2]);
					for (let j = 0; j < arr.length; j++) {
						let phys = arr[j];
						let fc = phys.fc
						let register = phys.register
						let quantity = phys.quantity
						let timeout = phys.timeout
						await acquire(host, port, subnum, fc, register, quantity, timeout)
							.then((resp) => {
								log.mark(resp);
							})
							.catch((err) => {
								log.error(err);
							});
					}
				}
			} catch (error) {
				logger.debug('on publish error:', error)
			}
		}, measureInterval);


//whether

//event

//alarm

//trip
