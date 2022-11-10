'use strict'
const express = require('express');
const router = express.Router();
const fs = require("fs")
const path = require('path')
let log4js = require('log4js');
let log = log4js.getLogger('routes::device');

router.get('/', /*jwt({ secret: globalConsts.TokenKey }),*/ function (req, res, next) {
	// var token = req.headers['x-access-token'];
	// log.debug(token);

	let modeldir = path.join(process.cwd(), './routes/model/');
	log.debug(modeldir);
	let dirs = fs.readdirSync(modeldir);
	log.debug(dirs);

	let candidates = dirs.filter(item => {
		log.debug(item);
		return fs.statSync(path.join(modeldir, item)).isDirectory();
	});
	let modelMap = new Map();
	let modelList = []
	dirs.forEach((item, index) => {
		log.debug(item, index);
		let picdir = path.join(process.cwd(), './public/images/model/' + item);
		log.debug(picdir);
		if (fs.existsSync(picdir)) {
			let imgs = fs.readdirSync(picdir);
			let pngs = imgs.filter(file => file.endsWith('.png'));
			let jpgs = imgs.filter(file => file.endsWith('.jpg'));
			let pics = pngs.concat(jpgs);
			if (pics.length > 0) {
				log.debug(pics[0]);
				let obj = { alt: item, src: '/images/model/' + item + '/' + pics[0], href: '/device/add?model=' + item };//src: 
				log.debug(obj);
				modelMap.set(item, obj);
				modelList.push(obj);
			}
		}
	})

	res.render('devices', {
		title: 'Select a model; Then Add, Configure, Commissioning',
		items: modelList
	})
})

router.get('/add', function (req, res, next) {
	log.debug(req.query);
	// Query String in URL
	let modelStr = req.query.model;
	log.debug(modelStr);

	res.write('Adding a device of:' + req.query.model, 'utf8', () => {
		console.log("Writing Dynamic Data Confirmed: " + req.query.model);
	});
	// Prints Output on the browser in response
	res.end('ok');
	// res.redirect('/')
})

module.exports = router;