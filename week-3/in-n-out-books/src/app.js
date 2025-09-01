/*
Author: Ben Hilarides
Date: 8.31.25
File Name: app.js
*/

const express = require("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");

const app = express(); // Creates an Express application

app.get("/", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>In-N-Out-Books</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 40px;
          background: #f4f4f4;
        }
        h1 {
          color: #333;
        }
        p {
          color: #555;
        }
      </style>
    </head>
    <body>
      <h1>Welcome to In-N-Out-Books</h1>
      <p>Your fast and reliable source for books online.</p>
    </body>
    </html>
  `;
  res.send(html);
});

app.use((req, res, next) => {
  next(createError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  if (app.get("env") === "development") {
    res.json({
      message: err.message,
      error: err.stack,
    });
  } else {
    res.json({
      message: err.message,
      error: {},
    });
  }
});

module.exports = app;