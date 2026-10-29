import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuestionCard from '../components/QuestionCard';
import * as authService from '../services/authService';
import '../styles/profile.css';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  
  const targetId = id || currentUser?._id;

  const [profileUser, setProfileUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answersCount, setAnswersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!targetId) return;
      try {
        const data = await authService.getUserProfile(targetId);
        setProfileUser(data);
        setQuestions(data.questions || []);
        setAnswersCount(data.answersCount || 0);
      } catch (err) {
        setError('Failed to load profile details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetId]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading profile details...</div>
        <Footer />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <div className="empty-state">
            <h3>User not found</h3>
            <p>The profile you are looking for does not exist or has been removed.</p>
            <Link to="/questions" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
              Browse Questions
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isSelf = currentUser && currentUser._id === profileUser._id;

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="profile-container animate-fade-up">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar" aria-hidden="true">
                {profileUser.profilePicture ? (
                  <img src={profileUser.profilePicture} alt={profileUser.username} />
                ) : (
                  profileUser.username?.charAt(0).toUpperCase()
                )}
              </div>
              <span className={`badge ${profileUser.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                {profileUser.role}
              </span>
            </div>

            <div className="profile-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <h2 className="profile-username">{profileUser.username}</h2>
                  <div className="profile-joined">Member since {formatDate(profileUser.createdAt)}</div>
                </div>
                {isSelf && (
                  <Link to="/profile/edit" className="btn btn-secondary btn-sm">
                    Edit Profile
                  </Link>
                )}
              </div>

              <div className="profile-bio">
                {profileUser.bio || "No biography details shared yet."}
              </div>

              <div className="profile-stats">
                <div className="profile-stat-box">
                  <div className="profile-stat-val">{profileUser.reputation || 0}</div>
                  <div className="profile-stat-lbl">Reputation</div>
                </div>
                <div className="profile-stat-box">
                  <div className="profile-stat-val">{questions.length}</div>
                  <div className="profile-stat-lbl">Questions Asked</div>
                </div>
                <div className="profile-stat-box">
                  <div className="profile-stat-val">{answersCount}</div>
                  <div className="profile-stat-lbl">Answers Posted</div>
                </div>
              </div>
            </div>
          </div>

          <h3 style={{ marginBottom: 'var(--space-4)' }}>
            {isSelf ? 'My Contributions' : `${profileUser.username}'s Questions`}
          </h3>
          <div className="questions-feed">
            {questions.length > 0 ? (
              questions.map((q) => (
                <QuestionCard key={q._id} question={{ ...q, author: profileUser }} />
              ))
            ) : (
              <div className="empty-state">
                <p>No questions posted yet by this user.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
