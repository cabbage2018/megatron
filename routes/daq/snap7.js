'use strict'
var express = require('express');
var router = express.Router();
let path = require('path')
let fs = require('fs')

let {
	acquire,
	access,
} = require('../../conn/daq/snap7');

module.exports = router

// function connect() { }

// function discovery() { }

// function acquire() { }

// function disconnect() { }