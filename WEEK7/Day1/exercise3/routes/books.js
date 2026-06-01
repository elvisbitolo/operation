const express = require('express');
const router = express.Router();

// Sample in-memory database for storing books
const books = [];

// Get all books
router.get('/', (req, res) => {
    res.json(books);
});

// Add a new book
router.post('/', (req, res) => {
    const { title, author } = req.body;
    if (!title || !author) return res.status(400).send('Title and Author are required');

    const newBook = { id: books.length + 1, title, author };
    books.push(newBook);
    res.status(201).json(newBook);
});

// Update a book by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, author } = req.body;
    const book = books.find(b => b.id === parseInt(id));

    if (book) {
        book.title = title || book.title;
        book.author = author || book.author;
        res.json(book);
    } else {
        res.status(404).send('Book not found');
    }
});

// Delete a book by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const index = books.findIndex(b => b.id === parseInt(id));

    if (index !== -1) {
        books.splice(index, 1);
        res.send('Book deleted');
    } else {
        res.status(404).send('Book not found');
    }
});

module.exports = router;
