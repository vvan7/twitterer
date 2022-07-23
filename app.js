var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const dotenv = require('dotenv').config();

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const tweetRouter = require('./routes/tweet');
const userRouter = require('./routes/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/tweet', tweetRouter);
app.use('/user', userRouter);

//Set up mongodb connection
const mongoose = require('mongoose');
mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
	console.log("Successfully connect to MongoDB.");
})
.catch(err => {
	console.error("Connection error", err);
	process.exit();
});

app.use(function(req, res, next) {
	res.status(404).send('404');
});

module.exports = app;
