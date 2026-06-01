import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createRoom, joinRoom } from '../services/api';
import '../styles/Home.css';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  // Room settings
  const [category, setCategory] = useState('mixed');
  const [difficulty, setDifficulty] = useState('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(15);
  const [showSettings, setShowSettings] = useState(false);

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!roomCode) return;
    setIsJoining(true);
    setError('');
    try {
      const actualDisplayName = displayName || user?.displayName || user?.email?.split('@')[0] || 'Player';
      const result = await joinRoom(roomCode, actualDisplayName);
      if (result.success) {
        navigate(`/lobby/${result.data.roomId}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to join room. Verify the code.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError('');
    try {
      const actualDisplayName = displayName || user?.displayName || user?.email?.split('@')[0] || 'Host';
      const settings = {
        displayName: actualDisplayName,
        category,
        difficulty,
        questionCount: Number(questionCount),
        timePerQuestion: Number(timeLimit),
      };
      const result = await createRoom(settings);
      if (result.success) {
        navigate(`/lobby/${result.data.roomId}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create room.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">
          WELCOME TO THE <br />
          <span className="gradient-text">TRIVIA ARENA by Remmy</span>
        </h1>
        <p className="hero-subtitle">
          Compete against players worldwide in real-time, fast-paced trivia games. 
          Claim the leaderboard throne!
        </p>
      </div>

      {error && <div className="home-error">{error}</div>}

      <div className="home-panels">
        {/* Join Room Panel */}
        <div className="glass-panel join-panel">
          <h2 className="panel-title">⚡ Enter Arena</h2>
          <form onSubmit={handleJoinRoom} className="home-form">
            {!user && (
              <div className="input-group">
                <label className="input-label">Nickname</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Your Gladiator name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={15}
                  required
                />
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Room Code</label>
              <input
                type="text"
                className="input-field room-code-input"
                placeholder="6-LETTER CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-secondary join-btn"
              disabled={isJoining || (user ? false : !displayName) || !roomCode}
            >
              {isJoining ? 'Entering...' : 'Enter Match'}
            </button>
          </form>
        </div>

        {/* Create Room Panel */}
        <div className="glass-panel create-panel">
          <h2 className="panel-title"> Host Room</h2>
          <p className="panel-desc">Create a custom battleground and invite your friends using a room code.</p>
          
          <button 
            className="btn btn-secondary settings-toggle-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ {showSettings ? 'Hide Settings' : 'Configure Settings'}
          </button>

          {showSettings && (
            <div className="room-settings-dropdown">
              <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  className="input-field select-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="mixed">Mixed Categories</option>
                  <option value="science">Science</option>
                  <option value="history">History</option>
                  <option value="sports">Sports</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="technology">Technology</option>
                  <option value="geography">Geography</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Difficulty</label>
                <select 
                  className="input-field select-field"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="mixed">Mixed Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="settings-row">
                <div className="input-group">
                  <label className="input-label">Questions</label>
                  <select 
                    className="input-field select-field"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                  >
                    <option value="5">5 Questions</option>
                    <option value="10">10 Questions</option>
                    <option value="15">15 Questions</option>
                    <option value="20">20 Questions</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Timer</label>
                  <select 
                    className="input-field select-field"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                  >
                    <option value="10">10 Seconds</option>
                    <option value="15">15 Seconds</option>
                    <option value="20">20 Seconds</option>
                    <option value="30">30 Seconds</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {!user ? (
            <div className="auth-alert">
              <p>You must sign in to host a custom match!</p>
              <Link to="/login" className="btn btn-primary auth-alert-btn">Sign In</Link>
            </div>
          ) : (
            <button
              onClick={handleCreateRoom}
              className="btn btn-primary create-btn"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Lobby'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
