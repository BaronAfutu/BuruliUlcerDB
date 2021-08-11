var express = require('express');
var router = express.Router();
var dbConnect = require('../bin/db');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('adminIndex');
});

router.get("/add",(req,res)=>{

});

module.exports = router;
