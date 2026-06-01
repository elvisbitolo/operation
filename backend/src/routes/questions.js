const express = require('express');
const router = express.Router();
const questions = require('../data/questions');

/**
 * GET /api/questions/categories
 * Get list of all unique categories
 */
router.get('/categories', (req, res) => {
  try {
    const categories = Array.from(new Set(questions.map((q) => q.category)));
    return res.status(200).json({
      success: true,
      data: { categories },
      error: null,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * GET /api/questions/random
 * Get random questions (without answers)
 */
router.get('/random', (req, res) => {
  try {
    const { count = 5, category, difficulty } = req.query;
    let pool = [...questions];

    if (category) {
      pool = pool.filter((q) => q.category.toLowerCase() === category.toLowerCase());
    }

    if (difficulty) {
      pool = pool.filter((q) => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Slice and remove correct answers
    const sliced = pool.slice(0, Math.min(Number(count), pool.length)).map((q) => ({
      id: q.id,
      category: q.category,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
      points: q.points,
    }));

    return res.status(200).json({
      success: true,
      data: { questions: sliced },
      error: null,
    });
  } catch (error) {
    console.error('Get random questions error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;
