var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_kiserd',
  password        : '6032',
  database        : 'cs290_kiserd'
});

module.exports.pool = pool;