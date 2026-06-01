import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Leaderboard.css';

export default function Leaderboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('global'); // global | weekly
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getLeaderboard(tab);
        if (res.success) {
          setList(res.data.leaderboard);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch leaderboard standings.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tab]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Loading Standings...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1 className="leaderboard-title gradient-text">HALL OF FAME</h1>
        <p className="leaderboard-subtitle">The elite gladiators of the Trivia Arena.</p>
      </div>

      {/* Tabs */}
      <div className="leaderboard-tabs">
        <button
          className={`tab-btn ${tab === 'global' ? 'active' : ''}`}
          onClick={() => setTab('global')}
        >
          🏆 Global ELO
        </button>
        <button
          className={`tab-btn ${tab === 'weekly' ? 'active' : ''}`}
          onClick={() => setTab('weekly')}
        >
          🔥 Top Score Accumulators
        </button>
      </div>

      {error && <div className="leaderboard-error">{error}</div>}

      {/* Leaderboard panel */}
      <div className="glass-panel leaderboard-panel">
        {list.length === 0 ? (
          <p className="no-data">No records found. Be the first to claim ELO!</p>
        ) : (
          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Gladiator</th>
                  <th>{tab === 'global' ? 'ELO Rating' : 'Points'}</th>
                  {tab === 'global' && <th>Matches</th>}
                  {tab === 'global' && <th>Accuracy</th>}
                </tr>
              </thead>
              <tbody>
                {list.map((player, idx) => (
                  <tr key={player.uid} className={player.uid === user?.uid ? 'is-me-row' : ''}>
                    <td className="rank-cell">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </td>
                    <td className="user-cell">
                      <span className="user-avatar-lbl">{player.photoURL || '🛡️'}</span>
                      <span className="user-name-lbl">{player.displayName}</span>
                      {player.uid === user?.uid && <span className="tag-me">YOU</span>}
                    </td>
                    <td className="score-cell highlight-val">
                      {tab === 'global' ? player.elo : `${player.points} pts`}
                    </td>
                    {tab === 'global' && <td>{player.gamesPlayed || 0}</td>}
                    {tab === 'global' && <td>{player.accuracy || 0}%</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="leaderboard-actions">
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Return to Arena ⚔️
        </button>
      </div>
    </div>
  );
}
