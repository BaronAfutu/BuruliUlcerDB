var mysql = require('mysql');
var config = require('./dbConfig.json');
//require('dotenv').config({ path: './.env' }); //Is present in index.js as well

if(process.env.ENV){
  config = {
    "host"     : process.env.SERVER,
    "user"     : process.env.USER_NAME,
    "password" : process.env.PASSWORD,
    "database" : process.env.DBNAME
  }
  //console.log(config);
}

var connection = mysql.createConnection(config);

try {
  connection.connect(function(err){
    if(err){
      console.error(`Error: Cannot connect to database!!!`);
      return;
    }
    console.log('connected to db as id ' + connection.threadId);
  });
} catch (error) {
  console.error(`Error!! Cannot connect to database server!!!`);
}

/*connection.connect(function(err){
  if(err){
    console.error('error connecting to db: ' + err.stack);
    return;
  }
  console.log('connected to db as id ' + connection.threadId);
});*/

module.exports = connection;