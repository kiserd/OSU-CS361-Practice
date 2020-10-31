var express = require('express');
var mysql = require('./dbcon.js');
var handlebars = require('express-handlebars').create({ defaultLayout:'main' });

var app = express();

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 6033);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const selectAllQuery = 'SELECT * FROM workout';
const insertQuery = "INSERT INTO workout (`name`, `reps`, `weight`, `date`, `unit`) VALUES (?, ?, ?, ?, ?)";
const deleteQuery = "DELETE FROM workout WHERE id=?";
const updateQuery = "UPDATE workout SET name=?, reps=?, weight=?, date=?, unit=? WHERE id=?";
const dropTableQuery = "DROP TABLE IF EXISTS workout";
const makeTableQuery = `CREATE TABLE workout(
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        name VARCHAR(255) NOT NULL,
                        reps INT,
                        weight INT,
                        date DATE,
                        unit BOOLEAN);`;


var convertDate = function(date) {
  var myDate = new Date(date);
  var month = myDate.getMonth() + 1;
  var day = myDate.getDate();
  var monthStr = '';
  var dayStr = '';
  // add '0' padding to single digit month
  if (month < 10) {
    monthStr = '0' + month;
  }
  else {
    monthStr = '' + month;
  }
  // add '0' padding to single digit day
  if (day < 10) {
    dayStr = '0' + day;
  }
  else {
    dayStr = '' + day;
  }
  
  var dateString = myDate.getFullYear() + '-' + monthStr + '-' + dayStr;
  return dateString;
}

var convertUnits = function(units) {
  var unitStr = '';
  if (units == 0) {
    unitStr = 'lb';
  }
  else {
    unitStr = 'kg';
  }
  return unitStr;
}

app.delete('/', (req, res, next) => {
  var deleteId = req.body.id;
  mysql.pool.query(deleteQuery, deleteId, (err, result) => {
    if(err){
      next(err);
      return;
    }
    // get updated table data
    mysql.pool.query(selectAllQuery, (err, rows, fields) => {
      if(err){
        next(err);
        return;
      }
      // convert dates to mm/dd/yyyy
      for (var i = 0; i < rows.length; i++) {
        rows[i]["date"] = convertDate(rows[i]["date"]);
      }

      // convert units to 'lb' or 'kg'
      for (var i = 0; i < rows.length; i++) {
        rows[i]["unit"] = convertUnits(rows[i]["unit"]);
      }

      // return updated table data to client
      res.json(rows);
    });
  });
});

app.get('/', (req , res, next) => {
  var context = {};
  mysql.pool.query(selectAllQuery, (err, rows, fields) => {
    if(err){
      next(err);
      return;
    }
    // convert dates to mm/dd/yyyy
    for (var i = 0; i < rows.length; i++) {
      rows[i]["date"] = convertDate(rows[i]["date"]);
    }

    // convert units to 'lb' or 'kg'
    for (var i = 0; i < rows.length; i++) {
      rows[i]["unit"] = convertUnits(rows[i]["unit"]);
    }

    context.rows = rows;
    res.render('home', context);
  });
});

app.put('/', (req, res, next) => {
  // place payload properties into array
  var updateData = [];
  for (index in req.body["updateArr"]) {
    updateData.push(req.body["updateArr"][index]);
  }
  updateData.push(req.body["id"]);

  // update data into table
  mysql.pool.query(updateQuery, updateData, (err, result) => {
    if(err){
      next(err);
      return;
    }
    // get updated table data
    mysql.pool.query(selectAllQuery, (err, rows, fields) => {
      if(err){
        next(err);
        return;
      }
      // convert dates to mm/dd/yyyy
      for (var i = 0; i < rows.length; i++) {
        rows[i]["date"] = convertDate(rows[i]["date"]);
      }

      // convert units to 'lb' or 'kg'
      for (var i = 0; i < rows.length; i++) {
        rows[i]["unit"] = convertUnits(rows[i]["unit"]);
      }

      // return updated table data to client
      res.json(rows);
    });
  });
});

app.post('/', (req, res, next) => {
  // place payload properties into array
  var payload = []
  for (key in req.body) {
    payload.push(req.body[key]);
  }
  // insert data into table
  mysql.pool.query(insertQuery, payload, (err, result) => {
    if(err){
      next(err);
      return;
    }
    // get updated table data
    mysql.pool.query(selectAllQuery, (err, rows, fields) => {
      if(err){
        next(err);
        return;
      }
      // convert dates to mm/dd/yyyy
      for (var i = 0; i < rows.length; i++) {
        rows[i]["date"] = convertDate(rows[i]["date"]);
      }

      // convert units to 'lb' or 'kg'
      for (var i = 0; i < rows.length; i++) {
        rows[i]["unit"] = convertUnits(rows[i]["unit"]);
      }

      // return updated table data to client
      res.json(rows);
    });
  });
});

app.get('/reset-table', (req, res, next) => {
  var context = {};
  mysql.pool.query(dropTableQuery, (err) => {
    if(err) {
      next(err);
      return;
    }
    mysql.pool.query(makeTableQuery, (err) => {
      if(err) {
        next(err);
        return;
      }
      // get updated table data
      mysql.pool.query(selectAllQuery, (err, rows, fields) => {
        if(err){
          next(err);
          return;
        }
        // convert dates to mm/dd/yyyy
        for (var i = 0; i < rows.length; i++) {
          rows[i]["date"] = convertDate(rows[i]["date"]);
        }

        // convert units to 'lb' or 'kg'
        for (var i = 0; i < rows.length; i++) {
          rows[i]["unit"] = convertUnits(rows[i]["unit"]);
        }

        // return updated table data to client
        res.json(rows);
      });
    });
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log(`Express started on http://${process.env.HOSTNAME}:${app.get('port')}; press Ctrl-C to terminate.`);
});
