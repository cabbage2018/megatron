'use strict'
let Routers = require('express-promise-router')
// create a new express-promise-router
// this has the same API as the normal express router except
// it allows you to use async functions as route handlers
let router = new Routers()

// export our router to be mounted by the parent application
// seems have to be the last line in the file
module.exports = router

let fs = require('fs')
let path = require('path')
let log4js = require('log4js')
let tracer = log4js.getLogger('routes::entrance')
let cache = require('../cache')

tracer.info("/***----------------------[" + __filename + "]------------------------**/")

router.post('/', parseForm, csrfProtection, async function (req, res, next/**/) {

	try {
		cache.connect()
			.then((client) => {
				client.set('framework', 'AngularJS')
				client.get('framework', function (err, reply) {
					redisClient.lpush("Power-6", "")
					console.log(reply);
				});
			})
			.catch()
	} catch (e) {
		res.status(507).send('not connected to local cache')
	}
	next()
})

router.get('/', csrfProtection, async function (req, res, next/**/) {
	tracer.warn(req.csrfToken())
	res.render('agents', {
		title: __filename,
		arrayJsonObj: infoArray,
		context: new Date().toISOString(),
		csrfToken: req.csrfToken("XSRF-TOKEN")
	})
	// pass the csrfToken to the view
	next()
})

router.delete('/', (req, res) => {
	res.render('dictionary', {
		title: __filename + new Date().toISOString(),
		items: obj
	})
})

router.put('/', (req, res) => {
	var redisValues = [];

	client.keys('*', function (err, keys) {
		if (err) return console.log(err);
		if (keys) {
			async.map(keys, function (key, cb) {
				client.get(key, function (error, value) {
					if (error) return cb(error);
					var redisObj = {};
					redisObj[key] = value;
					redisValues.push(redisObj);
				});
			});
		}
	});

	res.render('dictionary', {
		title: __filename + new Date().toISOString(),
		items: obj
	})
})

// A RESTful API is an architectural style for an application program interface(API) that uses HTTP requests to access and use data.That data can be used to GET, PUT, POST and DELETE data types, which refers to the reading, updating, creating and deleting of operations concerning resources.
// Representational State Transfer
