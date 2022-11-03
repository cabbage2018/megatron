'use strict'
////must following the backbone 
var express = require('express');
var router = express.Router();
router.get('/', function (req, res, next) {
	const url = req.url
	res.send(`${url} started @${startAt}, until ${new Date().toISOString()}`);
});
module.exports = router;