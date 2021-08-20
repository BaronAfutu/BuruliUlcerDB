var express = require('express');
var router = express.Router();
//var dbConnect = require('../bin/db');
var crypto = require('crypto');
var syncSql = require('sync-sql');
var config = require('../bin/dbConfig.json');
var session;


/* GET users listing. */
router.get('/', function(req, res) {
   // a variable to save a session
   var session = req.session;
   if(session.userid){
    var retrivedResults = {};
    let queries = {
      drug_target : "SELECT * from drug_target order by id desc limit 1",
      ethnopharmacological : "SELECT * from ethnopharmacological order by id desc limit 1",
      genome : "SELECT * from genome order by id desc limit 1",
      test_compounds : "SELECT * from test_compounds order by id desc limit 1",
      existing_drugs : "SELECT * from existing_drugs order by id desc limit 1"
    };
  
    for(qry in queries){
      let output = syncSql.mysql(config,queries[qry]);
      let error = output.success==false;
      let results = output.data.rows;
      //let fields = output.data.fields;
      
      if(error)res.render('error');
      retrivedResults[qry] =  results[0];
    }
     res.render('adminIndex',{
       results: retrivedResults,
       username: session.userName
     });
   }
   else{
     res.render('adminLogin',{
       title: 'Login',
       msg: 'You have to Login to Continue!!'
     });
   }
});


router.get('/login', function(req, res) {
  res.render('adminLogin',{
    title: '',
    msg: ''
  });
});

router.post('/login',(req,res)=>{
  let username = req.body['username'];
  let password = req.body['password'];


  let qry = "Select * from users where email='"+req.body['username']+"'";
  let output = syncSql.mysql(config,qry);
  let error = output.success==false;
  let results = output.data.rows;
  if(error)res.render('error',{errMsg:error});
  let resSize = results.length;
  let passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  
  if(resSize==1 && results[0]['password']==passwordHash){
    let session=req.session;
    session.userid = username;
    session.userType = "Admin";
    session.userName = results[0]['first_name']+" "+results[0]['last_name'];
    //console.log(req.session);
    res.redirect('/users/');
  }
  /*let username = req.body['username'];
  let password = req.body['password'];
  //username and password
  const myusername = 'user1'
  const mypassword = 'mypassword'
  
  if(username==myusername && password==mypassword){
    session=req.session;
    session.userid = username;
    //console.log(req.session);
    res.redirect('/users/');
  }*/
  else{
    res.render('adminLogin',{
      title: 'Login',
      msg: 'Invalid Credentials!!'
    });
  }
});

router.get('/logout',(req,res)=>{
  req.session.destroy();
  res.redirect('/');
});


router.get("/add",(req,res)=>{

});

module.exports = router;
