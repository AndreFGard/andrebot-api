var express = require('express');
var router = express.Router();

/* legacy functions*/
router.get('/', function(req, res, next) {
  res.send('Legacy route');
});

module.exports = router;
