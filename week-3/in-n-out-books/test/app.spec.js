const app = require("../src/app");
const request = require("supertest");

describe("Chapter 3: API Tests", () => {
  it("should return an array of books", async () => {
    const res = await request(app).get("/api/books");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);

    res.body.forEach((book) => {
      expect(book).toHaveProperty("id");
      expect(book).toHaveProperty("title");
      expect(book).toHaveProperty("author");
  });
});

  it("should return a single book", async () => {
    const res = await request(app).get("/api/books/1"); // test against known id
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("id", 1);
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("author");
  });


  it("should return a 400 error if the id is not a number", async () => {
    const res = await request(app).get("/api/books/abc"); // invalid id
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message", "Input must be a number.");
  });
});

describe("Chapter 4: POST /api/books", () => {
  it("should return a 201-status code when adding a new book", async() => {
    const newBook = {
      id: 101,
      title: "Pragmatic APIs with NodeJS and Express",
      author: "Richard Krasso"
    };
    const res = await request(app).post("/api/books").send(newBook);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("id");
  });

  it("should return a 400-status code when adding a new book with missing title", async() => {
    const res = await request(app).post("/api/books").send({
      id: 102,
      author: "Unknown" });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("message", "Book title is required.");
    });
  });

  it("should return a 204-status code when deleting a book", async() => {
    const bookToDelete = {
      id: 103,
      title: "To Be Deleted",
      author: "Meowth"
    };

    // Create the book and capture actual ID
    const createRes = await request(app).post("/api/books").send(bookToDelete);
    const actualId = createRes.body.id;

    const res = await request(app).delete(`/api/books/${actualId}`);
    expect(res.statusCode).toEqual(204);
  });

describe("Chapter 5: API Tests", () => {
  it("should update a book and return a 204-status code", async() => {
    const createRes = await request(app).post("/api/books").send({
      id: 300,
      title: "Original Title",
      author: "Original Author"
    });

    const actualId = createRes.body.id;

    // Update the book
    const updateRes = await request(app).put(`/api/books/${actualId}`).send({
      title: "Updated Title",
      author: "Updated Author"
    });

    expect(updateRes.statusCode).toEqual(204);
  });

  it("should return a 400-status code when using a non-numeric id for updating a book", async() => {
    const res = await request(app).put("/api/books/xyz").send({
      title: "Won't Work",
      author: "Nope"
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message", "Input must be a number.");
  });

  it("should return a 400-status code when updating a book with missing title", async() => {
    const createRes = await request(app).post("/api/books").send({
      id: 400,
      title: "Another Original Title",
      author: "Another Original Author"
    });
    const actualId = createRes.body.id;
    const res = await request(app).put(`/api/books/${actualId}`).send({
      author: "Homer Simpson" });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("message", "Book title is required.");
  });
});

describe("Chapter 7: API Tests", () => {
  it("should log a user in and return a 200-status with ‘Authentication successful’ message", async() => {
     const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "potter"
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Authentication successful");
  });

  it("should return a 401-status code with ‘Unauthorized’ message when logging in with incorrect credentials", async() => {
    const res = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu",
      password: "wrongpassword"
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });

  it("should return a 400-status code with ‘Bad Request’ when missing email or password", async() => {
    // Missing password
    const res1 = await request(app).post("/api/login").send({
      email: "harry@hogwarts.edu"
    });

    expect(res1.statusCode).toEqual(400);
    expect(res1.body.message).toEqual("Bad Request");

    // Missing email
    const res2 = await request(app).post("/api/login").send({
      password: "potter"
    });

    expect(res2.statusCode).toEqual(400);
    expect(res2.body.message).toEqual("Bad Request");
  });
});

describe("Chapter 8: API Tests", () => {
  it("should return a 200 status with ‘Security questions successfully answered’ message", async() => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-questions").send({
      email: "harry@hogwarts.edu",
      answers: [
        { answer: "Hedwig" },
        { answer: "Quidditch Through the Ages" },
        { answer: "Evans" }
      ]
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Security questions successfully answered");
  });

  it(" should return a 400 status code with ‘Bad Request’ message when the request body fails ajv validation", async() => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-questions").send({
      email: "harry@hogwarts.edu",
      answers: [
        { answer: 123 },
        { answer: "Quidditch Through the Ages" },
        { notAnswer: "Evans" }
      ]
    });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Bad Request");
  });

  it("should return a 401 status code with ‘Unauthorized’ message when security question answers are incorrect", async() => {
    const res = await request(app).post("/api/users/harry@hogwarts.edu/verify-security-questions").send({
      email: "harry@hogwarts.edu",
      answers: [
        { answer: "Wrong Answer" },
        { answer: "Through the Fire and the Flames" },
        { answer: "Jimmy" }
      ]
    });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual("Unauthorized");
  });
});