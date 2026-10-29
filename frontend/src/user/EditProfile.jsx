import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as authService from '../services/authService';
import '../styles/profile.css';

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatedUser = await authService.updateProfile(bio, profilePicture);
      setUser((prev) => ({
        ...prev,
        ...updatedUser
      }));
      setSuccess('Profile updated successfully.');
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <div className="edit-profile-card animate-fade-up">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: 'var(--bronze)',
              marginBottom: 'var(--space-1)'
            }}>
              Settings
            </div>
            <h2>Edit Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Update your public bio and profile avatar to showcase your academic interests.
            </p>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="status">{success}</div>}

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-avatar">Profile Avatar Image URL</label>
                <input
                  id="edit-avatar"
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/avatar.jpg"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                />
                <span className="form-hint">Paste a link to any accessible image URL.</span>
              </div>

              {profilePicture && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                  <img
                    src={profilePicture}
                    alt="Avatar preview"
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border)' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avatar preview</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="edit-bio">Biography</label>
                <textarea
                  id="edit-bio"
                  className="form-textarea"
                  placeholder="Describe your major, semester, favorite courses, or technical stack..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={1000}
                  rows={6}
                />
                <span className="form-hint">{bio.length}/1000 characters</span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving Changes...' : 'Save Settings'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfile;
