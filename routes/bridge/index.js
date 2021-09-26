var express = require('express');
var router = express.Router();

/* Put communications and data over MQTTs. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
