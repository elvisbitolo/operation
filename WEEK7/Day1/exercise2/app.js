const express = require('express');
const app = express();
const todoRouter = require('./routes/todos');

app.use(express.json());
app.use('/todos', todoRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Exercise 2 server running on http://localhost:${PORT}`);
});
