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
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>In-N-Out-Books</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
          color: #333;
        }
        header, footer {
          background-color: #444;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        main {
          padding: 2rem;
        }
        h1, h2 {
          color: #222;
        }
        section {
          margin-bottom: 2rem;
        }
        ul {
          list-style-type: square;
          padding-left: 20px;
        }
        .hours, .contact {
          background-color: #eee;
          padding: 1rem;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>In-N-Out-Books</h1>
        <p>Your fast and reliable source for books online</p>
      </header>
      <main>
        <section id="intro">
          <h2>Welcome</h2>
          <p>
            At In-N-Out-Books, we believe reading should be quick, easy, and enjoyable.
            Our goal is to provide the most popular titles at unbeatable prices,
            delivered right to your door.
          </p>
        </section>
        <section id="top-sellers">
          <h2>Top Selling Books</h2>
          <ul>
            <li><strong>The Great Gatsby</strong> by F. Scott Fitzgerald</li>
            <li><strong>1984</strong> by George Orwell</li>
            <li><strong>To Kill a Mockingbird</strong> by Harper Lee</li>
            <li><strong>The Catcher in the Rye</strong> by J.D. Salinger</li>
          </ul>
        </section>
        <section id="hours" class="hours">
          <h2>Hours of Operation</h2>
          <p>Monday - Friday: 9 AM - 8 PM</p>
          <p>Saturday: 10 AM - 6 PM</p>
          <p>Sunday: Closed</p>
        </section>
        <section id="contact" class="contact">
          <h2>Contact Us</h2>
          <p>Email: support@in-n-out-books.com</p>
          <p>Phone: (555) 123-4567</p>
          <p>Address: 123 Book Lane, Novel City, USA</p>
        </section>
      </main>
      <footer>
        <p>&copy; 2025 In-N-Out-Books. All rights reserved.</p>
      </footer>
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