const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/game/:roomId/question
 * Get current question for the room (without correct answer!)
 */
router.get('/:roomId/question', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomDoc = await db.collection('rooms').doc(roomId).get();

    if (!roomDoc.exists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Room not found',
      });
    }

    const roomData = roomDoc.data();

    if (roomData.status !== 'playing') {
      return res.status(400).json({
        success: false,
        data: null,
        error: `Game is not in progress. Status: ${roomData.status}`,
      });
    }

    const { currentQuestionIndex, questions } = roomData;

    if (currentQuestionIndex >= questions.length) {
      return res.status(200).json({
        success: true,
        data: {
          gameOver: true,
          message: 'All questions answered',
          scores: roomData.scores,
        },
        error: null,
      });
    }

    const currentQuestion = questions[currentQuestionIndex];

    // Send question WITHOUT correct answer
    return res.status(200).json({
      success: true,
      data: {
        question: {
          id: currentQuestion.id,
          category: currentQuestion.category,
          difficulty: currentQuestion.difficulty,
          question: currentQuestion.question,
          options: currentQuestion.options,
          points: currentQuestion.points,
        },
        questionNumber: currentQuestionIndex + 1,
        totalQuestions: questions.length,
        timeLimit: roomData.settings.timePerQuestion,
        roundStartedAt: roomData.roundStartedAt,
      },
      error: null,
    });
  } catch (error) {
    console.error('Get question error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * POST /api/game/:roomId/answer
 * Submit an answer (validates server-side, calculates points with speed bonus)
 */
router.post('/:roomId/answer', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { uid } = req.user;
    const { answerIndex, timeTaken } = req.body;

    if (answerIndex === undefined || answerIndex === null) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'answerIndex is required',
      });
    }

    const roomRef = db.collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Room not found',
      });
    }

    const roomData = roomDoc.data();

    if (roomData.status !== 'playing') {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Game is not in progress',
      });
    }

    // Check if player is in the room
    if (!roomData.players.some((p) => p.uid === uid)) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You are not in this room',
      });
    }

    const { currentQuestionIndex, questions, settings } = roomData;

    if (currentQuestionIndex >= questions.length) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'No more questions',
      });
    }

    // Check if player already answered this question
    const answerKey = `${currentQuestionIndex}_${uid}`;
    const existingAnswers = roomData.answers || {};
    if (existingAnswers[answerKey]) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'You already answered this question',
      });
    }

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;

    // Calculate points with speed bonus
    let pointsEarned = 0;
    if (isCorrect) {
      const basePoints = currentQuestion.points || 100;
      const timeLimit = settings.timePerQuestion || 15;
      const actualTimeTaken = Math.min(Math.max(timeTaken || timeLimit, 0), timeLimit);

      // Speed bonus = max(0, (timeLimit - timeTaken) / timeLimit * 50)
      const speedBonus = Math.max(0, Math.round(((timeLimit - actualTimeTaken) / timeLimit) * 50));
      pointsEarned = basePoints + speedBonus;
    }

    // Store the answer
    const answerData = {
      uid,
      questionIndex: currentQuestionIndex,
      answerIndex,
      isCorrect,
      pointsEarned,
      timeTaken: timeTaken || 0,
      answeredAt: new Date().toISOString(),
    };

    // Update Firestore
    const currentScore = roomData.scores[uid] || 0;
    await roomRef.update({
      [`answers.${answerKey}`]: answerData,
      [`scores.${uid}`]: currentScore + pointsEarned,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      data: {
        isCorrect,
        pointsEarned,
        correctAnswer: currentQuestion.correctAnswer,
        totalScore: currentScore + pointsEarned,
        speedBonus: isCorrect ? pointsEarned - (currentQuestion.points || 100) : 0,
      },
      error: null,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * GET /api/game/:roomId/results
 * Get round results (current question) or final results
 */
router.get('/:roomId/results', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomDoc = await db.collection('rooms').doc(roomId).get();

    if (!roomDoc.exists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Room not found',
      });
    }

    const roomData = roomDoc.data();
    const { currentQuestionIndex, questions, scores, answers, players } = roomData;

    // Build results for the current round
    const roundAnswers = {};
    for (const [key, answer] of Object.entries(answers || {})) {
      if (answer.questionIndex === currentQuestionIndex) {
        roundAnswers[answer.uid] = {
          answerIndex: answer.answerIndex,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          timeTaken: answer.timeTaken,
        };
      }
    }

    // Build leaderboard sorted by score
    const leaderboard = players
      .map((p) => ({
        uid: p.uid,
        displayName: p.displayName,
        score: scores[p.uid] || 0,
      }))
      .sort((a, b) => b.score - a.score);

    const isGameOver = currentQuestionIndex >= questions.length - 1;
    const currentQ = questions[currentQuestionIndex];

    return res.status(200).json({
      success: true,
      data: {
        questionNumber: currentQuestionIndex + 1,
        totalQuestions: questions.length,
        correctAnswer: currentQ ? currentQ.correctAnswer : null,
        correctAnswerText: currentQ ? currentQ.options[currentQ.correctAnswer] : null,
        roundAnswers,
        leaderboard,
        isGameOver,
        scores,
      },
      error: null,
    });
  } catch (error) {
    console.error('Get results error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * POST /api/game/:roomId/next
 * Move to next question (host only)
 */
router.post('/:roomId/next', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { uid } = req.user;

    const roomRef = db.collection('rooms').doc(roomId);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Room not found',
      });
    }

    const roomData = roomDoc.data();

    // Only host can advance to next question
    if (roomData.hostId !== uid) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'Only the host can advance to the next question',
      });
    }

    if (roomData.status !== 'playing') {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Game is not in progress',
      });
    }

    const nextIndex = roomData.currentQuestionIndex + 1;

    if (nextIndex >= roomData.questions.length) {
      // Game is over
      await roomRef.update({
        status: 'finished',
        currentQuestionIndex: nextIndex,
        updatedAt: new Date().toISOString(),
      });

      // Build final leaderboard
      const leaderboard = roomData.players
        .map((p) => ({
          uid: p.uid,
          displayName: p.displayName,
          score: roomData.scores[p.uid] || 0,
        }))
        .sort((a, b) => b.score - a.score);

      return res.status(200).json({
        success: true,
        data: {
          gameOver: true,
          message: 'Game finished!',
          leaderboard,
          scores: roomData.scores,
        },
        error: null,
      });
    }

    // Move to next question
    await roomRef.update({
      currentQuestionIndex: nextIndex,
      roundStartedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      data: {
        gameOver: false,
        questionNumber: nextIndex + 1,
        totalQuestions: roomData.questions.length,
      },
      error: null,
    });
  } catch (error) {
    console.error('Next question error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;
