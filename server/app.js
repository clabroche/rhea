process.title = 'rhea'
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require("helmet");

const indexRouter = require('./routes/index');
const compression = require('compression');

const app = express();
app.use(helmet());
app.use(logger('dev'));
app.options('*', function(req,res,next) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  next()
})
app.use(require('cors')({
  allowedHeaders: ['token', 'content-type'],
  exposedHeaders: 'true',
  credentials: false,
  origin: [
    'capacitor://localhost',
    'ionic://localhost',
    'http://localhost',
    'http://localhost:8080',
    'http://localhost:8100'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression())

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', require('./routes/users'));

module.exports = app;
