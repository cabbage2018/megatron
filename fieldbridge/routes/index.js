var express = require('express');
var router = express.Router();

let bridge = require('./OpcUaBridge')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
