const express = require('express');
const app = express();
const router = require('./routes/index');

app.use('/', router);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Exercise 1 server running on http://localhost:${PORT}`);
});
