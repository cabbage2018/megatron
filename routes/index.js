var express = require('express');
var router = express.Router();
const channelList= [
  'IEC61850',
  'ModbusRtu',
  'ModbusTcp',
  'Snap7',
  'OpcUa',
  'Error',
  
]

/* GET home page. */
router.get('/', function(req, res, next) {

  // deep clone
  let obj = JSON.parse(JSON.stringify(channelList))
  res.render('list', {
    title: __filename + new Date().toISOString(),
    items: obj
  })

});

module.exports = router;
