import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import '../styles/Auth.css';

const AVATARS = [
  '🧙‍♂️', '🥷', '🧑‍🚀', '🦖', '🦁', '🦊', '🦄', '🤖', '👾', '🐼', '🐯', '🦅'
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName || !email || !password) return;
    setLoading(true);
    setError('');
    try {
      // 1. Create auth user in Firebase
      const authUser = await register(email, password, displayName);
      
      // 2. Create user document in Express backend database
      await registerUser(displayName, selectedAvatar);
      
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Check details or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card register-card">
        <h2 className="auth-title">
          CREATE <span className="gradient-text">ACCOUNT</span>
        </h2>
        <p className="auth-subtitle">Choose your avatar and username to enter the arena.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Gladiator Username</label>
            <input
              type="text"
              className="input-field"
              placeholder="Leonidas"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={15}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Choose Avatar</label>
            <div className="avatar-grid">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  className={`avatar-choice ${selectedAvatar === avatar ? 'active' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="gladiator@trivia.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Forging Gladiator...' : 'Forged & Enter'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
