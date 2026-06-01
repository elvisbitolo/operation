import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { startGame, leaveRoom } from '../services/api';
import '../styles/Lobby.css';

export default function Lobby() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    setError('');
    const roomRef = doc(db, 'rooms', roomId);

    // Setup Firestore real-time listener for the room
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          setError('Room not found or has been disbanded by the host.');
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        setRoom({ id: docSnap.id, ...data });
        setLoading(false);

        // Redirect to game page when the game starts
        if (data.status === 'playing') {
          navigate(`/game/${docSnap.id}`);
        }
      },
      (err) => {
        console.error('Firestore lobby sync error:', err);
        setError('Failed to sync room lobby.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId, navigate]);

  const copyRoomCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartGame = async () => {
    if (!room || room.hostId !== user.uid) return;
    setStarting(true);
    setError('');
    try {
      await startGame(room.id);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to start game.');
      setStarting(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) return;
    setLeaving(true);
    try {
      await leaveRoom(room.id);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to leave room.');
      setLeaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Synchronizing Lobby...</p>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="lobby-container">
        <div className="glass-panel error-panel">
          <h2>⚠️ Lobby Error</h2>
          <p>{error || 'Lobby not available'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isHost = room.hostId === user.uid;

  return (
    <div className="lobby-container">
      <div className="lobby-grid">
        {/* Left Side: Room Info & Settings */}
        <div className="glass-panel info-panel">
          <h2 className="lobby-title">BATTLE LOBBY</h2>
          
          <div className="code-display">
            <span className="code-label">ROOM CODE</span>
            <div className="code-value-box" onClick={copyRoomCode} title="Click to copy">
              <span className="code-number">{room.code}</span>
              <span className="copy-icon">{copied ? '✅' : '📋'}</span>
            </div>
            <p className="code-subtext">Share this code with other players to join.</p>
          </div>

          <div className="lobby-settings-summary">
            <h3>⚔️ Match Rules</h3>
            <div className="summary-item">
              <span className="label">Category:</span>
              <span className="value">{room.settings?.category}</span>
            </div>
            <div className="summary-item">
              <span className="label">Difficulty:</span>
              <span className="value">{room.settings?.difficulty}</span>
            </div>
            <div className="summary-item">
              <span className="label">QuestionsCount:</span>
              <span className="value">{room.settings?.questionCount}</span>
            </div>
            <div className="summary-item">
              <span className="label">Timer Limit:</span>
              <span className="value">{room.settings?.timePerQuestion}s</span>
            </div>
          </div>

          <div className="lobby-actions">
            {isHost ? (
              <button
                className="btn btn-primary start-btn"
                onClick={handleStartGame}
                disabled={starting || room.players.length < 1}
              >
                {starting ? 'Initializing...' : 'Start Match'}
              </button>
            ) : (
              <div className="waiting-host-notice">
                <div className="small-spinner" />
                <span>Waiting for the Host to start...</span>
              </div>
            )}
            <button
              className="btn btn-secondary leave-btn"
              onClick={handleLeaveRoom}
              disabled={leaving}
            >
              {leaving ? 'Leaving...' : 'Leave Room'}
            </button>
          </div>
        </div>

        {/* Right Side: Players List */}
        <div className="glass-panel players-panel">
          <div className="players-header">
            <h3>👥 Gladiators ({room.players.length}/{room.maxPlayers})</h3>
          </div>
          <div className="players-list">
            {room.players.map((player) => (
              <div key={player.uid} className={`player-item ${player.uid === room.hostId ? 'is-host' : ''} ${player.uid === user.uid ? 'is-me' : ''}`}>
                <span className="player-avatar">
                  {player.uid === room.hostId ? '👑' : '🛡️'}
                </span>
                <div className="player-info">
                  <span className="player-name">{player.displayName}</span>
                  {player.uid === user.uid && <span className="tag-me">YOU</span>}
                  {player.uid === room.hostId && <span className="tag-host">HOST</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
