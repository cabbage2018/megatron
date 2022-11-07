'use strict'
var express = require('express');
var router = express.Router();

/*
  MODBUSTCP
*/
let {
	acquire,
	access,
	measure,
	tariff,
	schedule,
	commission } = require('../../conn/daq/modbustcp');
///modbus/access?ip='10.34.59.228'&port=503&subnum=126
router.get("/modbus/access/:ip/:port/:subnum", async (req, res, next) => {
	let physical = {};
	physical.ip = req.query.ip ?? '127.0.0.1';
	physical.port = req.query.port ?? 502;
	physical.subnum = req.query.subnum ?? 127;
	physical.responses = [];
	await access(physical.ip, physical.port, physical.subnum)
		.then((response) => {
			log.mark(response);
			physical['responses'].push(response);
		})
		.catch((error) => {
			log.error(error)
			physical.offline = error;
		})
})
///modbus/access?ip='10.34.59.228'&port=503&subnum=126&fc=3&ireg=201&quantity=100&timeout=6000&flash=[255,0,129]
router.get("/modbus/acquire/:uri", async (req, res, next) => {
	// let uri = req.params('uri') ?? '';
	let x = {};
	x.ip = req.params('ip') ?? '127.0.0.1';
	x.port = req.params('port') ?? 502;
	x.subnum = req.params('subnum') ?? 127;
	x.fc = req.params('fc') ?? 3;
	x.reg = req.params('reg') ?? 3021;
	x.quantity = req.params('quantity') ?? 127;
	x.timeout = req.params('timeout') ?? 6000;
	x.flash = req.params('flash') ?? [255, 0, 129];
	x.responses = [];
	await acquire(x.ip, x.port, x.subnum, x.fc, x.reg, x.quantity, x.timeout, x.flash/**/)
		.then((response) => {
			log.mark(response);
			x['responses'].push(response);
		})
		.catch((error) => {
			log.error(error)
			x['offline'] = error;
		})
})
module.exports = router