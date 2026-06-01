const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Part I: GET route
app.get('/api/hello', (req, res) => {
  res.send('Hello From Express');
});

// Part II: POST route
app.post('/api/world', (req, res) => {
  console.log('Received POST request body:', req.body);
  const inputValue = req.body.inputValue || req.body.message || '';
  res.send(`I received your POST request. This is what you sent me: ${inputValue}`);
});

app.listen(PORT, () => {
  console.log(`Express server is running on http://localhost:${PORT}`);
});
