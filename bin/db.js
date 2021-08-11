var mysql      =  require('mysql');
var config = require('./dbConfig.json')

var connection = mysql.createConnection(config);
connection.connect(function(err){
  if(err){
    console.error('error connecting to db: ' + err.stack);
    return;
  }
  console.log('connected to db as id ' + connection.threadId);
});

module.exports = connection;