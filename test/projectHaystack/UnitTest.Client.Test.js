'use strict'

const log4js = require('log4js')
const log = log4js.getLogger(':hs=client:')
let util = require('util');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Project Haystack' });
});


// my haystack - cllient

// Module dependencies .
var hs = require('nodehaystack');

let uri = "http://localhost/api/cccg";//, 
let user = "op";
let password = "XMG3-Rel.118";
let client = new hs.HClient(uri, user, password, "utf-8", 6000, 5000);
log.debug('Node Haystack Toolkit client starting up', client);

client.open((err, res) => {
    log.mark(util.inspect(client, true, null, true /* enable colors */));

    if (!err) {
        log.debug(res);
    } else {
        log.error(err);
    }

    let filter = "[site,point]";
    let limit = 99999;
    client.readAll(filter, limit, (err, r0) => {
        if (!err) {
            log.debug(r0);
        } else {
            log.error(err);
        }
    });

});

// console.log('Node Haystack Toolkit client starting up', client);

module.exports = router;
