import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminSidebar from './AdminSidebar';
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
      setReports(data || []);
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
    if (window.confirm(`Are you sure you want to delete this flagged ${contentType}? This action cannot be undone.`)) {
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading reports log...</div>
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
          <h2>Moderation Reports</h2>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <div className="admin-grid">
          <AdminSidebar />

          <section className="admin-main" aria-label="Moderation tickets">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Report Tickets ({reports.length})</h3>
            </div>

            <div className="admin-table-card table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Reporter</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Context</th>
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
                        <td>
                          <strong>{r.reporter?.username || 'Anonymous'}</strong>
                        </td>
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
                            <Link to={`/questions/${questionId}`} style={{ color: 'var(--ink-800)', fontWeight: 600 }}>
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
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(r.createdAt)}</td>
                        <td>
                          <div className="report-actions">
                            {r.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleStatusChange(r._id, 'dismissed')}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '4px 10px' }}
                                >
                                  Dismiss
                                </button>
                                {hasTarget && (
                                  <button
                                    onClick={() => handleDeleteContent(r._id, r.type, r.targetId._id)}
                                    className="btn btn-danger btn-sm"
                                    style={{ padding: '4px 10px' }}
                                  >
                                    Delete Content
                                  </button>
                                )}
                              </>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Resolved</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                        No reports logged in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
