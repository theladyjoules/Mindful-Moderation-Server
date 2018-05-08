var createError = require('http-errors');
var express = require('express');
var fileUpload = require('express-fileupload');
var cors = require('cors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var config = require('./config/main');

var staticUrl = '/static';
var publicFolder = path.resolve(__dirname, './public')//make sure you reference the right path
var apiRouter = require('./routes/api');

var app = express();

//Set up mongoose connection
var mongoose = require('mongoose');
mongoose.connect(config.database);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials'
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(staticUrl, express.static(publicFolder));
app.use(staticUrl, function(req, res, next) {
  res.send(404); 
});

app.use('/api', apiRouter);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.all('/*', function(req, res) {
  res.sendfile('index.html', {root: publicFolder});
});

module.exports = app;