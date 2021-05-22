const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const authenticationRouter = require('./routes/authentication.router');
const profileRouter = require('./routes/profile.router');
const datasetRouter = require('./routes/datasets.router');
const fileRouter = require('./routes/file.router');
const commentRouter = require('./routes/comment.router');
const commonRouter = require('./routes/common.router');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv/config');
const app = express();

//set cors
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

//connect mongodb
mongoose.set('useCreateIndex', true);
mongoose.connect(
  process.env.DB_connection,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => {
    console.log('Connected to DB');
  }
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Router
app.use('/api/auth', authenticationRouter);
app.use('/api/profile', profileRouter);
app.use('/api/dataset', datasetRouter);
app.use('/api/file', fileRouter);
app.use('/api/comment', commentRouter);
app.use('/api/common', commonRouter);

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
  res.send(res.locals.message);
});

module.exports = app;
