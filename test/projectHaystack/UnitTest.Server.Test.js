'use strict'

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    res.render('index', { title: 'Project Haystack' });
});


// my haystack - server

// Module dependencies .
var hs = require('nodehaystack'),
    http = require('http'),
    url = require('url');

// get the database - you will need to uncomment line #39 of index.js to use the TestDatabase
var db = new hs.TestDatabase();

var server = http.createServer(function (req, res) {
    req.setEncoding('utf8');
    
    req.on('readable', function () {
        var path = url.parse(req.url).pathname;

        // if root, then redirect to {haystack}/about
        if (typeof (path) === 'undefined' || path === null || path.length === 0 || path === "/") {
            res.writeHead(302, { 'Location': '/about' });
            res.end();
            return;
        }

        // parse URI path into "/{opName}/...."
        var slash = path.indexOf('/', 1);
        if (slash < 0) slash = path.length;
        var opName = path.substring(1, slash);

        // resolve the op
        db.op(opName, false, function (err, op) {
            if (typeof (op) === 'undefined' || op === null) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.write("404 Not Found");
                res.end();
                return;
            }

            // route to the op
            op.onServiceOp(db, req, res, function (err) {
                if (err) {
                    console.log(err.stack);
                    throw err;
                }

                res.end();
            });
        });
    });
});

log.debug('Node Haystack Toolkit listening at http://localhost:3000');

module.exports = router;
