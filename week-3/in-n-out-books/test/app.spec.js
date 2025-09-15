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
});