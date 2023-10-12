var express = require('express');
var router = express.Router();

/* GET,POST,UPDATE on index */
router.get('/', function(req, res, next) {
  res.send('The api is working!');
});

module.exports = router;
