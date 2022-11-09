'use strict'
const express = require('express');
const router = express.Router();
let log4js = require('log4js');
let log = log4js.getLogger('routes::device');

router.get('/', /*jwt({ secret: globalConsts.TokenKey }),*/ function (req, res, next) {
	var token = req.headers['x-access-token'];
	log.debug(token);
	let dirs = fs.readdirSync(path.join(process.cwd(), './routes/model/')).filter(item => fs.statSync(path.join(path.join(process.cwd(), './routes/daq/'), item)).isDirectory());
	let modelMap = new Map();
	let modelList = []
	dirs.forEach((item, index) => {
		log.debug(item, index);
		let subdir = path.join(process.cwd(), './public/model/' + item);
		let imgs = fs.readdirSync(subdir);
		let pngs = imgs.filter(file => file.endsWith('.png'));
		let jpgs = imgs.filter(file => file.endsWith('.jpg'));
		let pics = pngs.concat(jpgs);
		if (pics.length > 0) {
			log.debug(pics[0]);
			let obj = { alt: item, src: './public/model/' + pics[0], href: './device/add?model=' + pics[0] };
			modelMap.set(item, obj);
			modelList.push(obj);
		}
	})

	res.render('devices', {
		title: 'Select a model, Add, Configure, Commissioning',
		items: modelList
	})
})

router.get('/add', function (req, res, next) {
	log.debug(req.params);
	let modelStr = req.params.model;
	log.debug(modelStr);
})

module.exports = router;