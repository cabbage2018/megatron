'use strict'

var express = require('express');
var router = express.Router();
const path = require('path');
const fs = require('fs');
function sleep(ms) { return new Promise(function (resolve, reject) { setTimeout(resolve, ms); }) };
const Client = require('./myhaystack').client;
const log4js = require('log4js');
let log = log4js.getLogger(':mywrapper:');

let config = {
};

let targetPath = '/config/haystack.json';
if (fs.existsSync(path.join(process.cwd(), targetPath))) {
    config = JSON.parse(fs.readFileSync(path.join(process.cwd(), targetPath)));
}

/* GET home page. */
router.get('/', async function (req, res, next) {

    try {

        let actuator = new Client(config);
        let map = new Map();

        await sleep(1000);

        map.set("haystack", actuator);

        map.set("begin", new Date());

        let res1 = await actuator.connect();

        let res2 = await actuator.read("ver:\"3.0\"\nfilter,limit\n\"point\",2900\n");
        log.debug(res2);
        fs.writeFileSync(path.join(process.cwd(), "/logs/haystack.point.zinc"), res2, "utf-8");
        map.set("point", res2);

        let res3 = await actuator.hisRead("ver:\"3.0\"\nid,range\n@p:bsce:r:2b036cf4-615ac1ff,\"2023-04-02T03:23:14.239+08:00 Shanghai,2023-06-02T17:23:14.24+08:00 Shanghai\"\n");
        log.info(res3);
        map.set("@p:bsce:r:2b036cf4-615ac1ff", res3);

        res.render('dictionary', {
            title: __dirname + new Date().toISOString(),
            items: map
        })

    } catch (error) {
        res.render('error', { message: '@haystack protocol:/', error: error });
    }

});

router.get('/bsce', async function (req, res, next) {
    let actuator = new Client(config);
    let map = new Map();
    let res1 = await actuator.connect();

    map.set("haystack", actuator);
    map.set("begin", new Date());
    await sleep(100);

    try {

        for (let i = 0; i < config.idarray.length; i = i + 1) {
            let item = config.idarray[i];
            log.warn(item, "->>>");
            let body = `ver:\"3.0\"\nid\n${item}\n`;
            const res = await actuator.read(body);
            map.set(item, res);
            log.warn(item, res);
        }

        // for (const item of config.idarray) {
        //     let body = `ver:\"3.0\"\nid\n${item}\n`;
        //     const res = await actuator.read(body);
        //     map.set(item, res);
        //     log.warn(item, res);
        // }

        res.render('dictionary', {
            title: __dirname + new Date().toISOString(),
            items: map
        })

    } catch (error) {
        res.render('error', { message: '@haystack protocol', error: error });
    }


    // actuator.connect()
    //     .then((responseBody) => {
    //         log.info(responseBody);

    //         return actuator.hisRead("ver:\"3.0\"\nid,range\n@p:bsce:r:2b036cf4-615ac1ff,\"2023-04-02T03:23:14.239+08:00 Shanghai,2023-06-02T17:23:14.24+08:00 Shanghai\"\n");
    //     })
    //     .then((response) => {
    //         map.set("@p:bsce:r:2b036cf4-615ac1ff", response);

    //         log.info(response);

    //         // map.set("point", response);

    //         res.render('dictionary', {
    //             title: __dirname + new Date().toISOString(),
    //             items: map
    //         })
    //         return actuator.read("ver:\"3.0\"\nid\n@p:cccg:r:2aa57b48-445f2722\n@p:cccg:r:2aa57b48-445f2722\n");
    //     })
    //     .catch((error) => {
    //         log.error(error, "failed @haystack protocol access: /read...")
    //         map.set("error", error);
    //         res.render('error', { message: '@haystack protocol', error: error });
    //     });

});

router.get('/bundle', async function (req, res, next) {
    let actuator = new Client(config);
    let map = new Map();
    let res1 = await actuator.connect();
    map.set("begin", new Date());
    await sleep(100);
    let body = "ver:\"3.0\"\nid\n@p:cccg:r:2aa57b48-445f2722\n@p:cccg:r:2aa57b48-445f2722\n";

    try {
        for (let i = 0; i < config.idarray.length; i = i + 1) {
            let item = config.idarray[i];
            body = body + `${item}\n`
        }
        const zinc = await actuator.read(body);
        log.warn(body, zinc);
        map.set(body, zinc);

        res.render('dictionary', {
            title: __dirname + new Date().toISOString(),
            items: map
        })

    } catch (error) {
        res.render('error', { message: '@haystack protocol', error: error });
    }
});

router.get('/his', async function (req, res, next) {
    try {
        let actuator = new Client(config);
        let map = new Map();
        map.set("haystack", actuator);
        map.set("begin", new Date());
        let res1 = await actuator.connect();
        for (const item of config.idarray) {
            let body = `ver:\"3.0\"\nid,range\n${item},\"2023-04-02T03:23:14.239+08:00 Shanghai,2023-06-02T17:23:14.24+08:00 Shanghai\"\n`;
            log.warn(body);
            const res = await actuator.hisRead(body);
            await sleep(10);
            map.set(item, res);
        }

        res.render('dictionary', {
            title: __dirname + new Date().toISOString(),
            items: map
        })

    } catch (error) {
        res.render('error', { message: '@haystack protocol', error: error });
    }
});

module.exports = router;

