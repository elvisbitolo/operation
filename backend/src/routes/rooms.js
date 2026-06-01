const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');
const questions = require('../data/questions');

/**
 * Generate a unique 6-character alphanumeric room code
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Select random questions for a game session
 */
function selectQuestions(count = 10, category = null, difficulty = null) {
  let pool = [...questions];

  if (category && category !== 'mixed') {
    pool = pool.filter((q) => q.category.toLowerCase() === category.toLowerCase());
  }

  if (difficulty && difficulty !== 'mixed') {
    pool = pool.filter((q) => q.difficulty === difficulty);
  }

  // Shuffle and pick
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * POST /api/rooms/create
 * Create a new game room
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const {
      displayName,
      maxPlayers = 8,
      questionCount = 10,
      timePerQuestion = 15,
      category = 'mixed',
      difficulty = 'mixed',
    } = req.body;

    // Generate unique room code
    let roomCode;
    let codeExists = true;
    while (codeExists) {
      roomCode = generateRoomCode();
      const existing = await db.collection('rooms').where('code', '==', roomCode).get();
      const activeRooms = existing.docs.filter((doc) => doc.data().status !== 'finished');
      codeExists = activeRooms.length > 0;
    }

    // Select questions for this room
    const selectedQuestions = selectQuestions(questionCount, category, difficulty);

    if (selectedQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'No questions available for the selected category/difficulty',
      });
    }

    const roomData = {
      code: roomCode,
      hostId: uid,
      players: [
        {
          uid,
          displayName: displayName || email.split('@')[0],
          email,
          joinedAt: new Date().toISOString(),
        },
      ],
      maxPlayers: Math.min(Math.max(maxPlayers, 2), 20),
      status: 'waiting', // waiting | playing | finished
      currentQuestionIndex: 0,
      questions: selectedQuestions,
      scores: {
        [uid]: 0,
      },
      answers: {},
      settings: {
        questionCount: selectedQuestions.length,
        timePerQuestion,
        category,
        difficulty,
      },
      roundStartedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const roomRef = await db.collection('rooms').add(roomData);

    return res.status(201).json({
      success: true,
      data: {
        roomId: roomRef.id,
        roomCode,
        room: {
          ...roomData,
          questions: undefined, // Don't send questions to client
        },
      },
      error: null,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * POST /api/rooms/join
 * Join a room by code
 */
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { code, displayName } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Room code is required',
      });
    }

    // Find room by code
    const roomsSnapshot = await db
      .collection('rooms')
      .where('code', '==', code.toUpperCase())
      .where('status', '==', 'waiting')
      .limit(1)
      .get();

    if (roomsSnapshot.empty) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Room not found or game already started',
      });
    }

    const roomDoc = roomsSnapshot.docs[0];
    const roomData = roomDoc.data();

    // Check if player is already in the room
    if (roomData.players.some((p) => p.uid === uid)) {
      return res.status(200).json({
        success: true,
        data: {
          roomId: roomDoc.id,
          roomCode: roomData.code,
          message: 'Already in room',
        },
        error: null,
      });
    }

    // Check if room is full
    if (roomData.players.length >= roomData.maxPlayers) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Room is full',
      });
    }

    // Add player to room
    const newPlayer = {
      uid,
      displayName: displayName || email.split('@')[0],
      email,
      joinedAt: new Date().toISOString(),
    };

    await roomDoc.ref.update({
      players: [...roomData.players, newPlayer],
      [`scores.${uid}`]: 0,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      data: {
        roomId: roomDoc.id,
        roomCode: roomData.code,
        players: [...roomData.players, newPlayer],
      },
      error: null,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * GET /api/rooms/:roomId
 * Get room state (without question answers)
 */
router.get('/:roomId', async (req, res) => {
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

    // Remove question answers before sending
    const safeRoom = {
      ...roomData,
      id: roomDoc.id,
      questions: roomData.questions.map((q) => ({
        id: q.id,
        category: q.category,
        difficulty: q.difficulty,
      })),
    };

    return res.status(200).json({
      success: true,
      data: { room: safeRoom },
      error: null,
    });
  } catch (error) {
    console.error('Get room error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * POST /api/rooms/:roomId/start
 * Start the game (host only)
 */
router.post('/:roomId/start', authMiddleware, async (req, res) => {
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

    // Only host can start the game
    if (roomData.hostId !== uid) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'Only the host can start the game',
      });
    }

    if (roomData.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Game has already started or finished',
      });
    }

    if (roomData.players.length < 1) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Need at least 1 player to start',
      });
    }

    await roomRef.update({
      status: 'playing',
      currentQuestionIndex: 0,
      roundStartedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Game started!',
        status: 'playing',
        totalQuestions: roomData.questions.length,
      },
      error: null,
    });
  } catch (error) {
    console.error('Start game error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * POST /api/rooms/:roomId/leave
 * Leave a room
 */
router.post('/:roomId/leave', authMiddleware, async (req, res) => {
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
    const updatedPlayers = roomData.players.filter((p) => p.uid !== uid);

    // If host leaves and there are other players, transfer host
    if (roomData.hostId === uid && updatedPlayers.length > 0) {
      await roomRef.update({
        players: updatedPlayers,
        hostId: updatedPlayers[0].uid,
        updatedAt: new Date().toISOString(),
      });
    } else if (updatedPlayers.length === 0) {
      // Delete room if no players left
      await roomRef.delete();
      return res.status(200).json({
        success: true,
        data: { message: 'Room deleted (no players remaining)' },
        error: null,
      });
    } else {
      await roomRef.update({
        players: updatedPlayers,
        updatedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      data: { message: 'Left the room successfully' },
      error: null,
    });
  } catch (error) {
    console.error('Leave room error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * DELETE /api/rooms/:roomId
 * Delete a room (host only)
 */
router.delete('/:roomId', authMiddleware, async (req, res) => {
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

    if (roomData.hostId !== uid) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'Only the host can delete the room',
      });
    }

    await roomRef.delete();

    return res.status(200).json({
      success: true,
      data: { message: 'Room deleted successfully' },
      error: null,
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;
