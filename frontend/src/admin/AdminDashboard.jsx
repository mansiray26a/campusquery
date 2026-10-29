import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminSidebar from './AdminSidebar';
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
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: 'var(--bronze)',
            marginBottom: 'var(--space-1)'
          }}>
            Governance
          </div>
          <h2>Admin Portal</h2>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="admin-grid">
          <AdminSidebar />

          <section className="admin-main" aria-label="Administrative metrics">
            <h3 style={{ fontSize: '1.25rem' }}>Platform Metrics</h3>
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
                <span className="admin-stat-label">Course Tags</span>
              </div>
              <div
                className="admin-stat-card"
                style={stats?.pendingReports > 0 ? { borderLeft: '4px solid var(--danger)' } : {}}
              >
                <span className="admin-stat-num" style={stats?.pendingReports > 0 ? { color: 'var(--danger)' } : {}}>
                  {stats?.pendingReports || 0}
                </span>
                <span className="admin-stat-label">Pending Reports</span>
              </div>
            </div>

            <div className="card" style={{ marginTop: 'var(--space-3)' }}>
              <h4>Campus Moderation Guidelines</h4>
              <p style={{ marginTop: 'var(--space-2)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                Welcome to the CampusQuery administration portal. Use the navigation sidebar to review reported questions and answers, manage course catalog tags, and oversee community accounts. All moderation actions (e.g. deleting offensive posts or demoting spam accounts) take effect immediately across the knowledge base.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
