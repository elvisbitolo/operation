import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import '../styles/Profile.css';

const AVATARS = [
  '🧙‍♂️', '🥷', '🧑‍🚀', '🦖', '🦁', '🦊', '🦄', '🤖', '👾', '🐼', '🐯', '🦅'
];

export default function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing profile
  const [displayName, setDisplayName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user?.uid) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getProfile(user.uid);
        if (res.success) {
          setProfileData(res.data.user);
          setDisplayName(res.data.user.displayName || '');
          setSelectedAvatar(res.data.user.photoURL || AVATARS[0]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName || !user?.uid) return;

    setSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      // 1. Update database profile in backend
      const res = await updateProfile(user.uid, displayName, selectedAvatar);
      
      if (res.success) {
        setProfileData(res.data.user);
        
        // 2. Update local Firebase Auth user profile
        await updateUserProfile({
          displayName,
          photoURL: selectedAvatar,
        });

        setSuccessMsg('Profile forged successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p className="loading-text">Retrieving Records...</p>
      </div>
    );
  }

  const accuracy = profileData?.totalAnswers
    ? Math.round((profileData.correctAnswers / profileData.totalAnswers) * 100)
    : 0;

  return (
    <div className="profile-container">
      <div className="profile-grid">
        {/* Left Side: Stats and Info Card */}
        <div className="glass-panel profile-card">
          <div className="avatar-display">
            <span className="avatar-big">{profileData?.photoURL || '🛡️'}</span>
          </div>

          <h2 className="gladiator-name">{profileData?.displayName}</h2>
          <p className="gladiator-rank">ELO: {profileData?.elo || 1000}</p>

          <div className="stats-box">
            <div className="stat-card">
              <span className="stat-label">Wins</span>
              <span className="stat-value">{profileData?.gamesWon || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Matches</span>
              <span className="stat-value">{profileData?.gamesPlayed || 0}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{accuracy}%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Best Streak</span>
              <span className="stat-value">{profileData?.bestStreak || 0}</span>
            </div>
          </div>

          {!isEditing && (
            <button className="btn btn-secondary edit-profile-btn" onClick={() => setIsEditing(true)}>
              ⚙️ Modify Gladiator
            </button>
          )}
        </div>

        {/* Right Side: Edit Form (if editing) or Match Summary */}
        <div className="glass-panel action-panel">
          {isEditing ? (
            <div>
              <h3 className="panel-section-title">🛠️ Modify Details</h3>
              {error && <div className="profile-error">{error}</div>}

              <form onSubmit={handleSave} className="profile-form">
                <div className="input-group">
                  <label className="input-label">Gladiator Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={15}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Select Icon</label>
                  <div className="profile-avatar-grid">
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar}
                        type="button"
                        className={`profile-avatar-choice ${selectedAvatar === avatar ? 'active' : ''}`}
                        onClick={() => setSelectedAvatar(avatar)}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Forging'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h3 className="panel-section-title">📜 Combat Records</h3>
              {successMsg && <div className="profile-success">{successMsg}</div>}
              
              <div className="records-summary">
                <div className="record-item">
                  <span className="record-lbl">Gladiator ID:</span>
                  <span className="record-val code-font">{profileData?.uid}</span>
                </div>
                <div className="record-item">
                  <span className="record-lbl">Joined Arena:</span>
                  <span className="record-val">
                    {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="record-item">
                  <span className="record-lbl">Total Points Earned:</span>
                  <span className="record-val highlight-color">{profileData?.totalPoints || 0} pts</span>
                </div>
                <div className="record-item">
                  <span className="record-lbl">Total Answers Submitted:</span>
                  <span className="record-val">{profileData?.totalAnswers || 0}</span>
                </div>
                <div className="record-item">
                  <span className="record-lbl">Total Correct Answers:</span>
                  <span className="record-val text-success">{profileData?.correctAnswers || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
