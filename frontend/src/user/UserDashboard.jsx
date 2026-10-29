import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuestionCard from '../components/QuestionCard';
import * as authService from '../services/authService';
import '../styles/userDashboard.css';

/* SVG Icons */
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconUserEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recent');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setStats(null);
    setError('');
    setLoading(true);

    const fetchDashboardData = async () => {
      try {
        const data = await authService.getUserDashboardData();
        if (active) setStats(data);
      } catch (err) {
        if (active) {
          setError('Failed to load dashboard data. Please try again.');
          console.error(err);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { active = false; };
  }, [user?._id]);

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
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <div style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: 'var(--bronze)',
            marginBottom: 'var(--space-1)'
          }}>
            Overview
          </div>
          <h2>Student Dashboard</h2>
        </div>
        
        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="dashboard-grid">
          <aside className="dashboard-sidebar" aria-label="Student overview">
            <div className="user-summary-card">
              <div className="dashboard-avatar" aria-hidden="true">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <h3 className="dashboard-username">{user?.username}</h3>
              <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-student'}`}>
                {user?.role}
              </span>
              
              <div className="stats-mini-grid">
                <div className="stat-mini-item">
                  <div className="stat-mini-val">{stats ? stats.reputation : '—'}</div>
                  <div className="stat-mini-lbl">Reputation</div>
                </div>
                <div className="stat-mini-item">
                  <div className="stat-mini-val">{stats ? stats.questionCount : '—'}</div>
                  <div className="stat-mini-lbl">Asked</div>
                </div>
                <div className="stat-mini-item">
                  <div className="stat-mini-val">{stats ? stats.answerCount : '—'}</div>
                  <div className="stat-mini-lbl">Solved</div>
                </div>
              </div>
            </div>

            <nav className="sidebar-nav" aria-label="Quick actions">
              <Link to="/ask" className="sidebar-nav-btn">
                <IconPlus /> Ask a Question
              </Link>
              <Link to="/profile/edit" className="sidebar-nav-btn">
                <IconUserEdit /> Edit Profile
              </Link>
              <Link to="/questions" className="sidebar-nav-btn">
                <IconSearch /> Browse All Questions
              </Link>
            </nav>
          </aside>

          <section className="dashboard-main" aria-label="Dashboard questions">
            <div className="dashboard-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'recent'}
                className={`dashboard-tab${activeTab === 'recent' ? ' active' : ''}`}
                onClick={() => setActiveTab('recent')}
                style={{ background: 'none', border: 'none' }}
              >
                My Questions ({stats?.recentQuestions?.length || 0})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'saved'}
                className={`dashboard-tab${activeTab === 'saved' ? ' active' : ''}`}
                onClick={() => setActiveTab('saved')}
                style={{ background: 'none', border: 'none' }}
              >
                Bookmarked Questions ({stats?.savedQuestions?.length || 0})
              </button>
            </div>

            <div className="questions-list">
              {error ? (
                <div className="empty-state" role="alert">
                  <h3>Dashboard data unavailable</h3>
                  <p>{error}</p>
                </div>
              ) : activeTab === 'recent' ? (
                stats?.recentQuestions && stats.recentQuestions.length > 0 ? (
                  stats.recentQuestions.map((q) => (
                    <QuestionCard key={q._id} question={q} />
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No Questions Asked Yet</h3>
                    <p>Have an inquiry or stuck on a concept? Post your first question.</p>
                    <Link to="/ask" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
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
                    <h3>No Bookmarked Questions</h3>
                    <p>Save helpful questions while browsing to reference them later.</p>
                    <Link to="/questions" className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
                      Browse Questions
                    </Link>
                  </div>
                )
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
