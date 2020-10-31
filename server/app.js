process.title = 'rhea'
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.options('*', function(req,res,next) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  next()
})
app.use(require('cors')({
  allowedHeaders: ['token', 'content-type'],
  exposedHeaders: 'true',
  credentials: false,
  origin: ['http://localhost:8080']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', require('./routes/users'));

module.exports = app;
