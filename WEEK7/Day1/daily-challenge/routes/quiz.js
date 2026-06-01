const express = require('express');
const router = express.Router();

const triviaQuestions = [
  {
    question: "What is the capital of France?",
    answer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    answer: "Mars",
  },
  {
    question: "What is the largest mammal in the world?",
    answer: "Blue whale",
  },
];

let currentQuestionIndex = 0;
let userScore = 0;

// GET /quiz: Start the quiz and display the first question
router.get('/', (req, res) => {
    if (currentQuestionIndex < triviaQuestions.length) {
        res.send(`
            <h1>Question ${currentQuestionIndex + 1}</h1>
            <p>${triviaQuestions[currentQuestionIndex].question}</p>
            <form action="/quiz" method="POST">
                <input type="text" name="answer" placeholder="Your answer" required>
                <button type="submit">Submit Answer</button>
            </form>
        `);
    } else {
        res.redirect('/quiz/score');
    }
});

// POST /quiz: Submit an answer to the current question and move to the next
router.post('/', (req, res) => {
    const userAnswer = req.body.answer;
    const correctAnswer = triviaQuestions[currentQuestionIndex].answer;

    let feedback = '';
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        userScore++;
        feedback = 'Correct! Good job.';
    } else {
        feedback = `Wrong! The correct answer was: ${correctAnswer}`;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < triviaQuestions.length) {
        res.send(`
            <p>${feedback}</p>
            <p><a href="/quiz">Next Question</a></p>
        `);
    } else {
        res.send(`
            <p>${feedback}</p>
            <p><a href="/quiz/score">Finish Quiz</a></p>
        `);
    }
});

// GET /quiz/score: Display the user’s final score
router.get('/score', (req, res) => {
    res.send(`
        <h1>Quiz Completed!</h1>
        <p>Your final score is: ${userScore} out of ${triviaQuestions.length}</p>
        <p><a href="/quiz/reset">Play Again</a></p>
    `);
});

// Reset route for easy testing
router.get('/reset', (req, res) => {
    currentQuestionIndex = 0;
    userScore = 0;
    res.redirect('/quiz');
});

module.exports = router;
