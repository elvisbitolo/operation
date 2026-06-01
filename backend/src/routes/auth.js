const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Create or update a user profile in Firestore
 */
router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { uid, email } = req.user;
    const { displayName, photoURL } = req.body;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Update existing user
      await userRef.update({
        displayName: displayName || userDoc.data().displayName,
        photoURL: photoURL || userDoc.data().photoURL,
        email,
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Create new user
      await userRef.set({
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL || null,
        elo: 1000,
        gamesPlayed: 0,
        gamesWon: 0,
        totalPoints: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        streak: 0,
        bestStreak: 0,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const updatedDoc = await userRef.get();

    return res.status(200).json({
      success: true,
      data: { user: updatedDoc.data() },
      error: null,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * GET /api/auth/profile/:uid
 * Get a user profile by uid
 */
router.get('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user: userDoc.data() },
      error: null,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

/**
 * PUT /api/auth/profile/:uid
 * Update a user profile (requires auth, must be the same user)
 */
router.put('/profile/:uid', authMiddleware, async (req, res) => {
  try {
    const { uid } = req.params;

    // Users can only update their own profile
    if (req.user.uid !== uid) {
      return res.status(403).json({
        success: false,
        data: null,
        error: 'You can only update your own profile',
      });
    }

    const { displayName, photoURL } = req.body;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'User not found',
      });
    }

    const updateData = { updatedAt: new Date().toISOString() };
    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    await userRef.update(updateData);
    const updatedDoc = await userRef.get();

    return res.status(200).json({
      success: true,
      data: { user: updatedDoc.data() },
      error: null,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: error.message,
    });
  }
});

module.exports = router;
