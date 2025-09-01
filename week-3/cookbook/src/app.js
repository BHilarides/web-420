/*
Author: Ben Hilarides
Date: 8.31.25
File Name: app.js
*/

// Setting up express application
const express = require("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");

const app = express(); // Creates an Express application

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
 next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
 res.status(err.status || 500);
 res.json({
 type: 'error',
 status: err.status,
 message: err.message,
 stack: req.app.get('env') === 'development' ? err.stack : undefined
 });
});