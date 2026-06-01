import { auth } from './firebase';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }
  return { 'Content-Type': 'application/json' };
}

async function apiRequest(endpoint, options = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// Auth profile endpoints
export const registerUser = (displayName = '', photoURL = '') =>
  apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ displayName, photoURL }),
  });

export const getProfile = (uid) =>
  apiRequest(`/auth/profile/${uid}`);

export const updateProfile = (uid, displayName, photoURL) =>
  apiRequest(`/auth/profile/${uid}`, {
    method: 'PUT',
    body: JSON.stringify({ displayName, photoURL }),
  });

// Room endpoints
export const createRoom = (settings = {}) =>
  apiRequest('/rooms/create', {
    method: 'POST',
    body: JSON.stringify(settings),
  });

export const joinRoom = (code, displayName = '') =>
  apiRequest('/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ code, displayName }),
  });

export const getRoomState = (roomId) =>
  apiRequest(`/rooms/${roomId}`);

export const leaveRoom = (roomId) =>
  apiRequest(`/rooms/${roomId}/leave`, {
    method: 'POST',
  });

// Game endpoints
export const startGame = (roomId) =>
  apiRequest(`/rooms/${roomId}/start`, {
    method: 'POST',
  });

export const getQuestion = (roomId) =>
  apiRequest(`/game/${roomId}/question`);

export const submitAnswer = (roomId, answerIndex, timeTaken) =>
  apiRequest(`/game/${roomId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ answerIndex, timeTaken }),
  });

export const getResults = (roomId) =>
  apiRequest(`/game/${roomId}/results`);

export const nextQuestion = (roomId) =>
  apiRequest(`/game/${roomId}/next`, {
    method: 'POST',
  });

// Leaderboard endpoints
export const getLeaderboard = (type = 'global') =>
  apiRequest(`/leaderboard/${type}`);

export const updateLeaderboardStats = (roomId) =>
  apiRequest('/leaderboard/update', {
    method: 'POST',
    body: JSON.stringify({ roomId }),
  });
