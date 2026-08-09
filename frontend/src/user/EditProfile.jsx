import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as authService from '../services/authService';
import '../styles/profile.css';

const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      }, 1500);
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
        <div className="edit-profile-card">
          <h2>Edit Profile Settings</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Update your public details and showcase your experience to other students.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Profile Avatar Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Paste a direct URL to an avatar image"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biography</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe your academic interests, courses you've completed, coding skills..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
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
