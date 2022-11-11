var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let indexRouter = require('./routes/');
let modbusRouter = require('./routes/daq/modbus');
let opcuaRouter = require('./routes/daq/opcua');
let simocodeRouter = require('./routes/model/simocode');
let usersRouter = require('./routes/users');
let blogRouter = require('./routes/markdown/index');
let modelsRouter = require('./routes/models');
// let simocodeRouter = require('./routes/model/simocode');
let deviceRouter = require('./routes/device');

let app = express();

// app.configure(function () {
// 	app.use(express.static(__dirname + '/public', { maxAge: 1000 * 60 * 60 }));
// 	app.use(express.directory(__dirname + '/public'));
// 	app.use(express.errorHandler());
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static('public'))
app.use(express.static(path.join(process.cwd(), './public')));
// app.use(express.static(__dirname + '/public'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/blog', blogRouter);
app.use('/models', modelsRouter);
app.use('/modbus', modbusRouter);
app.use('/opcua', opcuaRouter);
app.use('/simocode', simocodeRouter);
app.use('/device', deviceRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
