import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuestionCard from '../components/QuestionCard';
import * as authService from '../services/authService';
import '../styles/userDashboard.css';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await authService.getUserDashboardData();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading dashboard details...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <h2>Dashboard</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="dashboard-grid">
          <div className="dashboard-sidebar">
            <div className="card user-summary-card">
              <div className="dashboard-avatar">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user?.username.charAt(0).toUpperCase()
                )}
              </div>
              <h3 className="dashboard-username">{user?.username}</h3>
              <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                {user?.role}
              </span>
              
              <div className="stats-mini-grid">
                <div className="stat-mini-item">
                  <div className="stat-mini-val">{stats?.reputation || 0}</div>
                  <div className="stat-mini-lbl">Rep</div>
                </div>
                <div className="stat-mini-item">
                  <div className="stat-mini-val">{stats?.questionCount || 0}</div>
                  <div className="stat-mini-lbl">Asked</div>
                </div>
                <div className="stat-mini-item">
                  <div className="stat-mini-val">{stats?.answerCount || 0}</div>
                  <div className="stat-mini-lbl">Solved</div>
                </div>
              </div>
            </div>

            <div className="sidebar-nav">
              <Link to="/ask" className="sidebar-nav-btn">
                ✍ Ask a Question
              </Link>
              <Link to="/profile/edit" className="sidebar-nav-btn">
                ⚙ Edit Profile
              </Link>
              <Link to="/questions" className="sidebar-nav-btn">
                🔍 Browse All Questions
              </Link>
            </div>
          </div>

          <div className="dashboard-main">
            <div className="dashboard-tabs">
              <div
                className={`dashboard-tab ${activeTab === 'recent' ? 'active' : ''}`}
                onClick={() => setActiveTab('recent')}
              >
                My Questions ({stats?.recentQuestions?.length || 0})
              </div>
              <div
                className={`dashboard-tab ${activeTab === 'saved' ? 'active' : ''}`}
                onClick={() => setActiveTab('saved')}
              >
                Bookmarked Questions ({stats?.savedQuestions?.length || 0})
              </div>
            </div>

            <div className="questions-list">
              {activeTab === 'recent' ? (
                stats?.recentQuestions && stats.recentQuestions.length > 0 ? (
                  stats.recentQuestions.map((q) => (
                    <QuestionCard key={q._id} question={q} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No Questions Asked Yet</h3>
                    <p style={{ marginTop: '8px' }}>Stuck on a campus course concept? Create your first post.</p>
                    <Link to="/ask" className="btn btn-primary" style={{ marginTop: '16px' }}>
                      Ask Question
                    </Link>
                  </div>
                )
              ) : (
                stats?.savedQuestions && stats.savedQuestions.length > 0 ? (
                  stats.savedQuestions.map((q) => (
                    <QuestionCard key={q._id} question={q} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No Saved Questions</h3>
                    <p style={{ marginTop: '8px' }}>Bookmark helpful questions to review them later.</p>
                    <Link to="/questions" className="btn btn-secondary" style={{ marginTop: '16px' }}>
                      Browse Questions
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
