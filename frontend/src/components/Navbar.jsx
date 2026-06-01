import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileOpen(false)}>
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Trivia Arena</span>
        </Link>

        <button
          className={`hamburger ${mobileOpen ? 'active' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>
            <span className="nav-icon">🏠</span> Home
          </Link>
          <Link to="/leaderboard" className="nav-link" onClick={() => setMobileOpen(false)}>
            <span className="nav-icon">🏆</span> Leaderboard
          </Link>
          {user && (
            <Link to="/profile" className="nav-link" onClick={() => setMobileOpen(false)}>
              <span className="nav-icon">👤</span> Profile
            </Link>
          )}

          <div className="nav-auth">
            {user ? (
              <div className="nav-user">
                <span className="nav-user-name">{user.displayName || 'Player'}</span>
                <button className="btn-nav-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-nav-login" onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
