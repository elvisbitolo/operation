const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

/**
 * GET /api/leaderboard/global
 * Get top 50 players by ELO
 */
router.get('/global', async (req, res) => {
  try {
    const usersSnapshot = await db
      .collection('users')
      .orderBy('elo', 'desc')
      .limit(50)
      .get();

    const leaderboard = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        uid: data.uid,
        displayName: data.displayName,
        photoURL: data.photoURL,
        elo: data.elo || 1000,
        gamesPlayed: data.gamesPlayed || 0,
        gamesWon: data.gamesWon || 0,
        accuracy: data.totalAnswers ? Math.round((data.correctAnswers / data.totalAnswers) * 100) : 0,
      });
    });

    return res.status(200).json({
      success: true,
      data: { leaderboard },
      error: null,
    });
  } catch (error) {
    console.error('Global leaderboard error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * GET /api/leaderboard/weekly
 * Get top 50 players by total points (acting as weekly ranking)
 */
router.get('/weekly', async (req, res) => {
  try {
    const usersSnapshot = await db
      .collection('users')
      .orderBy('totalPoints', 'desc')
      .limit(50)
      .get();

    const leaderboard = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        uid: data.uid,
        displayName: data.displayName,
        photoURL: data.photoURL,
        points: data.totalPoints || 0,
        elo: data.elo || 1000,
        gamesPlayed: data.gamesPlayed || 0,
      });
    });

    return res.status(200).json({
      success: true,
      data: { leaderboard },
      error: null,
    });
  } catch (error) {
    console.error('Weekly leaderboard error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * POST /api/leaderboard/update
 * Update player stats after a game completes.
 * Can be called by players when they reach the results screen,
 * but only once per game per user.
 */
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.user;
    const { roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'roomId is required',
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

    // Verify room is finished
    if (roomData.status !== 'finished') {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Game is not finished yet',
      });
    }

    // Verify player was in the room
    const player = roomData.players.find((p) => p.uid === uid);
    if (!player) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You were not a player in this room',
      });
    }

    // Check if player has already had stats updated for this game
    const processedPlayersKey = `processedPlayers.${uid}`;
    if (roomData.processedPlayers && roomData.processedPlayers[uid]) {
      return res.status(200).json({
        success: true,
        data: { message: 'Stats already updated for this player' },
        error: null,
      });
    }

    // Calculate player stats for this game
    const totalQuestions = roomData.questions.length;
    let correctCount = 0;
    let answeredCount = 0;
    let bestLocalStreak = 0;
    let currentLocalStreak = 0;

    for (let i = 0; i < totalQuestions; i++) {
      const answerKey = `${i}_${uid}`;
      const ans = roomData.answers && roomData.answers[answerKey];
      if (ans) {
        answeredCount++;
        if (ans.isCorrect) {
          correctCount++;
          currentLocalStreak++;
          if (currentLocalStreak > bestLocalStreak) {
            bestLocalStreak = currentLocalStreak;
          }
        } else {
          currentLocalStreak = 0;
        }
      }
    }

    const playerScore = roomData.scores[uid] || 0;

    // Determine ranking in this game
    const playerScores = roomData.players.map((p) => ({
      uid: p.uid,
      score: roomData.scores[p.uid] || 0,
    })).sort((a, b) => b.score - a.score);

    const playerRank = playerScores.findIndex((ps) => ps.uid === uid) + 1;
    const isWinner = playerRank === 1 && roomData.players.length > 1; // Only count win if more than 1 player

    // Calculate ELO change
    // Simple ELO formula: winner gets +25, others get -5 to +15 depending on position
    let eloChange = 0;
    if (roomData.players.length > 1) {
      const numPlayers = roomData.players.length;
      if (isWinner) {
        eloChange = 25;
      } else {
        // Linear scale based on ranking
        // e.g. 2nd of 4 gets +5, 4th gets -15
        const midPoint = (numPlayers + 1) / 2;
        eloChange = Math.round((midPoint - playerRank) * 10);
      }
    } else {
      // Single player game ELO change is smaller
      eloChange = isWinner ? 5 : 0;
    }

    const userRef = db.collection('users').doc(uid);
    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        return;
      }

      const userData = userDoc.data();
      const currentElo = userData.elo || 1000;
      const newElo = Math.max(100, currentElo + eloChange);

      const updatedStats = {
        gamesPlayed: (userData.gamesPlayed || 0) + 1,
        gamesWon: (userData.gamesWon || 0) + (isWinner ? 1 : 0),
        totalPoints: (userData.totalPoints || 0) + playerScore,
        correctAnswers: (userData.correctAnswers || 0) + correctCount,
        totalAnswers: (userData.totalAnswers || 0) + answeredCount,
        bestStreak: Math.max(userData.bestStreak || 0, bestLocalStreak),
        elo: newElo,
        updatedAt: new Date().toISOString(),
      };

      transaction.update(userRef, updatedStats);
    });

    // Mark player as processed in the room
    await roomRef.update({
      [`processedPlayers.${uid}`]: true,
    });

    return res.status(200).json({
      success: true,
      data: {
        eloChange,
        isWinner,
        score: playerScore,
        correctAnswers: correctCount,
        totalQuestions,
      },
      error: null,
    });
  } catch (error) {
    console.error('Update stats error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;
