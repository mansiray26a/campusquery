import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as adminService from '../services/adminService';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getAdminStats();
        setStats(data);
      } catch (err) {
        setError('Failed to fetch administrator statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading administration console...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <h2>Admin Portal</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="admin-grid">
          <div className="admin-sidebar">
            <Link to="/admin" className="admin-nav-item active">📊 Stats Overview</Link>
            <Link to="/admin/users" className="admin-nav-item">👥 Manage Users</Link>
            <Link to="/admin/questions" className="admin-nav-item">❓ Manage Questions</Link>
            <Link to="/admin/answers" className="admin-nav-item">💬 Manage Answers</Link>
            <Link to="/admin/tags" className="admin-nav-item">🏷️ Manage Tags</Link>
            <Link to="/admin/reports" className="admin-nav-item">🚨 Reports Review</Link>
          </div>

          <div className="admin-main">
            <h3>Overview Metrics</h3>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <span className="admin-stat-num">{stats?.totalUsers || 0}</span>
                <span className="admin-stat-label">Total Users</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">{stats?.totalQuestions || 0}</span>
                <span className="admin-stat-label">Questions Asked</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">{stats?.totalAnswers || 0}</span>
                <span className="admin-stat-label">Answers Posted</span>
              </div>
              <div className="admin-stat-card">
                <span className="admin-stat-num">{stats?.totalTags || 0}</span>
                <span className="admin-stat-label">Unique Course Tags</span>
              </div>
              <div className="admin-stat-card" style={stats?.pendingReports > 0 ? { borderLeft: '4px solid var(--danger)' } : {}}>
                <span className="admin-stat-num" style={stats?.pendingReports > 0 ? { color: 'var(--danger)' } : {}}>{stats?.pendingReports || 0}</span>
                <span className="admin-stat-label">Pending Reports</span>
              </div>
            </div>

            <div className="card" style={{ marginTop: '20px' }}>
              <h4>Moderator Guideline Summary</h4>
              <p style={{ marginTop: '10px', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Welcome to the CampusQuery administration panel. Use the sidebar controls to moderate reported posts, review registration rolls, delete flagged questions or answers, and configure catalog tags. Ensure all campus guidelines are met when deleting student content.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
