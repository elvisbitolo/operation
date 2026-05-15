const express = require('express');
const app = express();
const bookRouter = require('./routes/books');

app.use(express.json());
app.use('/books', bookRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Exercise 3 server running on http://localhost:${PORT}`);
});
