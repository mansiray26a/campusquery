import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as adminService from '../services/adminService';
import * as questionService from '../services/questionService';
import * as answerService from '../services/answerService';
import '../styles/adminDashboard.css';
import '../styles/manageQuestions.css';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReports = async () => {
    try {
      const data = await adminService.getReports();
      setReports(data);
    } catch (err) {
      setError('Failed to fetch reports list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleStatusChange = async (reportId, newStatus) => {
    setError('');
    setSuccess('');
    try {
      await adminService.updateReportStatus(reportId, newStatus);
      setSuccess(`Report marked as ${newStatus}.`);
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update report status.');
    }
  };

  const handleDeleteContent = async (reportId, contentType, targetId) => {
    if (window.confirm(`Are you sure you want to delete this flagged ${contentType}? This action is permanent.`)) {
      setError('');
      setSuccess('');
      try {
        if (contentType === 'Question') {
          await questionService.deleteQuestion(targetId);
        } else {
          await answerService.deleteAnswer(targetId);
        }

        await adminService.updateReportStatus(reportId, 'resolved');
        setSuccess('Flagged content deleted and report resolved successfully.');
        fetchReports();
        setTimeout(() => setSuccess(''), 3500);
      } catch (err) {
        setError(err.message || 'Failed to delete flagged content.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading reports logs...</div>
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
        {success && <div className="alert alert-success">{success}</div>}

        <div className="admin-grid">
          <div className="admin-sidebar">
            <Link to="/admin" className="admin-nav-item">📊 Stats Overview</Link>
            <Link to="/admin/users" className="admin-nav-item">👥 Manage Users</Link>
            <Link to="/admin/questions" className="admin-nav-item">❓ Manage Questions</Link>
            <Link to="/admin/answers" className="admin-nav-item">💬 Manage Answers</Link>
            <Link to="/admin/tags" className="admin-nav-item">🏷️ Manage Tags</Link>
            <Link to="/admin/reports" className="admin-nav-item active">🚨 Reports Review</Link>
          </div>

          <div className="admin-main">
            <h3>Reports Moderation</h3>
            <div className="admin-table-card table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Reporter</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Content Preview / Context</th>
                    <th>Status</th>
                    <th>Reported On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => {
                    const hasTarget = !!r.targetId;
                    const questionId = r.type === 'Question' ? r.targetId?._id : r.targetId?.question;
                    
                    return (
                      <tr key={r._id}>
                        <td>{r.reporter?.username || 'Anonymous'}</td>
                        <td>
                          <span className={`badge ${r.type === 'Question' ? 'badge-student' : 'badge-admin'}`}>
                            {r.type}
                          </span>
                        </td>
                        <td>
                          <div className="report-reason-box" title={r.reason}>
                            {r.reason}
                          </div>
                        </td>
                        <td>
                          {hasTarget && questionId ? (
                            <Link to={`/questions/${questionId}`} style={{ color: 'var(--primary)', fontWeight: '500' }}>
                              View Context
                            </Link>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Deleted</span>
                          )}
                        </td>
                        <td>
                          <span className={`report-status-badge status-${r.status}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          <div className="report-actions">
                            {r.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(r._id, 'dismissed')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 8px' }}
                                >
                                  Dismiss
                                </button>
                                {hasTarget && (
                                  <button
                                    onClick={() => handleDeleteContent(r._id, r.type, r.targetId._id)}
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: '4px 8px' }}
                                  >
                                    Delete Content
                                  </button>
                                )}
                              </>
                            )}
                            {r.status !== 'pending' && (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Resolved</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No reports logged in system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
