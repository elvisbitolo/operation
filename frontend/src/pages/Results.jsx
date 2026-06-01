import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResults, updateLeaderboardStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Results.css';

export default function Results() {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [statsUpdated, setStatsUpdated] = useState(false);
  const [statsResult, setStatsResult] = useState(null); // { eloChange, isWinner, correctAnswers }

  useEffect(() => {
    if (!roomId) return;

    const fetchResultsAndSync = async () => {
      try {
        setLoading(true);
        setError('');
        
        // 1. Fetch game results
        const res = await getResults(roomId);
        if (res.success) {
          setResults(res.data);
        }

        // 2. Trigger post-game ELO & Stats updates
        try {
          const updateRes = await updateLeaderboardStats(roomId);
          if (updateRes.success) {
            setStatsResult(updateRes.data);
            setStatsUpdated(true);
          }
        } catch (updateErr) {
          // Silent catch or info (might be already processed)
          console.info('Stats update skipped or already completed:', updateErr.message);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to fetch final results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResultsAndSync();
  }, [roomId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Tallying Scores...</p>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="results-container">
        <div className="glass-panel error-panel">
          <h2>⚠️ Results Unavailable</h2>
          <p>{error || 'Results not found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { leaderboard } = results;
  const isSinglePlayer = leaderboard.length === 1;

  // Podium spots (up to 3 players)
  const firstPlace = leaderboard[0];
  const secondPlace = leaderboard[1];
  const thirdPlace = leaderboard[2];

  return (
    <div className="results-container">
      {/* Celebration Banner */}
      <div className="results-header">
        <h1 className="results-main-title gradient-text">MATCH RESOLVED</h1>
        <p className="results-subtitle">Here is how the battlefield settled.</p>
      </div>

      {/* Gladiator ELO Status Banner */}
      {statsUpdated && statsResult && (
        <div className="glass-panel elo-status-panel">
          <div className="status-grid">
            <div className="status-item">
              <span className="lbl">Accuracy</span>
              <span className="val">
                {statsResult.correctAnswers} / {statsResult.totalQuestions}
              </span>
            </div>
            <div className="status-item">
              <span className="lbl">Battle Status</span>
              <span className={`val ${statsResult.isWinner ? 'winner-glow' : ''}`}>
                {statsResult.isWinner ? '👑 CHAMPION' : '🛡️ GLADIATOR'}
              </span>
            </div>
            <div className="status-item">
              <span className="lbl">ELO Adjust</span>
              <span className={`val elo-change ${statsResult.eloChange >= 0 ? 'plus' : 'minus'}`}>
                {statsResult.eloChange >= 0 ? `+${statsResult.eloChange}` : statsResult.eloChange}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Podium Display (only if multiplayer) */}
      {!isSinglePlayer && (
        <div className="podium-wrapper">
          {/* 2nd Place */}
          {secondPlace && (
            <div className="podium-spot second">
              <div className="avatar-holder">🥈</div>
              <span className="podium-name">{secondPlace.displayName}</span>
              <span className="podium-score">{secondPlace.score} pts</span>
              <div className="podium-bar">2</div>
            </div>
          )}

          {/* 1st Place */}
          {firstPlace && (
            <div className="podium-spot first">
              <div className="avatar-holder crown-animation">👑🥇</div>
              <span className="podium-name">{firstPlace.displayName}</span>
              <span className="podium-score">{firstPlace.score} pts</span>
              <div className="podium-bar">1</div>
            </div>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <div className="podium-spot third">
              <div className="avatar-holder">🥉</div>
              <span className="podium-name">{thirdPlace.displayName}</span>
              <span className="podium-score">{thirdPlace.score} pts</span>
              <div className="podium-bar">3</div>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="glass-panel final-scoreboard-panel">
        <h2 className="section-title">📊 Final Standings</h2>
        <div className="results-list">
          {leaderboard.map((item, idx) => (
            <div key={item.uid} className={`results-item ${item.uid === user.uid ? 'is-me' : ''}`}>
              <span className="results-rank">#{idx + 1}</span>
              <span className="results-name">{item.displayName}</span>
              {item.uid === user.uid && <span className="tag-me">YOU</span>}
              <span className="results-score">{item.score} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn btn-primary home-btn" onClick={() => navigate('/')}>
          Play Again ⚔️
        </button>
        <button className="btn btn-secondary leaderboard-btn" onClick={() => navigate('/leaderboard')}>
          Leaderboard 🏆
        </button>
      </div>
    </div>
  );
}
