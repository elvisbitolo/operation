require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // For local files if needed
}));
app.use(morgan('dev'));

// CORS configuration - allow all for development, customize for production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Check if Firebase is initialized correctly
try {
  const { db } = require('./src/config/firebase');
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error) {
  console.error('CRITICAL: Firebase Admin initialization failed:', error.message);
}

// Import Routes
const authRoutes = require('./src/routes/auth');
const roomRoutes = require('./src/routes/rooms');
const gameRoutes = require('./src/routes/game');
const leaderboardRoutes = require('./src/routes/leaderboard');
const questionRoutes = require('./src/routes/questions');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/questions', questionRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    error: null,
  });
});

// Root route (for testing deployment)
app.get('/', (req, res) => {
  res.send('Trivia Arena API Server is running.');
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    data: null,
    error: 'Endpoint not found',
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    data: null,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
