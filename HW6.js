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


app.get('/', (req , res, next) => {
  var context = {};
  res.render('home', context);
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
