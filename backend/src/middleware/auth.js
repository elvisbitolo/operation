const { admin } = require('../config/firebase');

/**
 * Authentication middleware - verifies Firebase ID tokens.
 * Attaches decoded user info to req.user on success.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
      });
    }

    const idToken = authHeader.split('Bearer ')[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'No token provided',
      });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      data: null,
      error: 'Invalid or expired token',
    });
  }
};

module.exports = authMiddleware;
