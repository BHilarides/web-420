/*
Author: Ben Hilarides
Date: 9.14.25
File Name: app.js
*/

const express = require("express");
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const users = require("../database/users");

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

const books = require("../database/books");

app.use(express.json()); // Middleware to parse JSON bodies

// GET route to return books
app.get("/api/books", async (req, res, next) => {
  try {
    const allBooks = await books.find();
    console.log("All books: ", allBooks);
    res.json(allBooks); // Send the books collection as JSON response
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});


// GET route to return a single book by ID
app.get("/api/books/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Validate id
    if (isNaN(id)) {
      const err = new Error("Input must be a number.");
      err.status = 400;
      console.error("Error: ", err.message);
      return next(err);
    }

    // Find book
    const book = await books.findOne({ id });

    if (!book) {
      const err = new Error("Book not found.");
      err.status = 404;
      console.error("Error: ", err.message);
      return next(err);
    }

    console.log("Book: ", book);
    res.json(book); // Send the found book as JSON response
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
    }
  });

// POST route to add a new book
app.post("/api/books", async (req, res, next) => {
  try {
    const { title, author } = req.body;

    // Validate required field
    if (!title) {
      const err = new Error("Book title is required.");
      err.status = 400;
      return next(err);
    }

    // Get all books to determine next ID
    const allBooks = await books.find();
    const id = allBooks.length ? Math.max(...allBooks.map(b => b.id)) + 1 : 1; // Generate new id
    const newBook = { id, title, author };

    await books.insertOne(newBook);

    res.status(201).json({ id: newBook.id }); // Send the added book's id as JSON response with 201 status
  } catch (err) {
    console.error("Error: ", err.message);
    next(err);
  }
});

// POST route to login a user
app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      const err = new Error("Bad Request");
      err.status = 400;
      throw err;
    }

    // Look up user
    const user = await users.findOne({ email });
    if (!user) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    // Compare passwords
    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      const err = new Error("Unauthorized");
      err.status = 401;
      throw err;
    }

    // Successful authentication
    res.status(200).json({ message: "Authentication successful" });

  } catch (err) {
    next(err);
  }
});

// PUT route to update a book by ID
app.put("/api/books/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Validate id
    if (isNaN(id)) {
      const err = new Error("Input must be a number.");
      err.status = 400;
      return next(err);
    }

    // Validate that title exists in body
    const { title, author } = req.body;
    if (!title) {
      const err = new Error("Book title is required.");
      err.status = 400;
      return next(err);
    }

    // Check if book exists
    const existingBook = await books.findOne({ id });
    if (!existingBook) {
      const err = new Error("Book not found.");
      err.status = 404;
      return next(err);
    }

    // Update book
    await books.updateOne(
      { id },
      { $set: { title, author } } // update with new title/author
    );

    // Return 204 No Content
    res.status(204).send();
  } catch (err) {
    console.error("Error: ", err.message);
      next(err);
    }
  });

// Delete route to remove a book by ID
app.delete("/api/books/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // Validate id
    if (isNaN(id)) {
      const err = new Error("Input must be a number.");
      err.status = 400;
      return next(err);
    }

    // Check if book exists
    const book = await books.findOne({ id });
    if (!book) {
      const err = new Error("Book not found.");
      err.status = 404;
      return next(err);
    }

    // Delete book
    await books.deleteOne({ id });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// 404 Handler
app.use((req, res, next) => {
  next(createError(404, "Page Not Found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  if (process.env.NODE_ENV === "development") {
    res.json({
      message: err.message,
      error: err.stack,
    });
  } else {
    res.json({
      message: err.message,
      error: {}
    });
  }
});

module.exports = app;