const express = require('express');
const app = express();
const quizRouter = require('./routes/quiz');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/quiz', quizRouter);

// Homepage to start the quiz
app.get('/', (req, res) => {
    res.send('<h1>Welcome to the Trivia Quiz!</h1><p>Go to <a href="/quiz">/quiz</a> to start.</p>');
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Daily Challenge quiz server running on http://localhost:${PORT}`);
});
