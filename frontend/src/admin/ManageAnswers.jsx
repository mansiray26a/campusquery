import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminSidebar from './AdminSidebar';
import * as adminService from '../services/adminService';
import * as answerService from '../services/answerService';
import '../styles/adminDashboard.css';
import '../styles/manageQuestions.css';

const ManageAnswers = () => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAnswers = async () => {
    try {
      const data = await adminService.getAnswers();
      setAnswers(data || []);
    } catch (err) {
      setError('Failed to fetch answers registry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  const handleDelete = async (ansId) => {
    if (window.confirm('Are you sure you want to delete this answer permanently?')) {
      setError('');
      setSuccess('');
      try {
        await answerService.deleteAnswer(ansId);
        setSuccess('Answer deleted successfully.');
        fetchAnswers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete answer.');
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
        <div className="loading-spinner">Loading answers database...</div>
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
          <h2>Manage Answers</h2>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <div className="admin-grid">
          <AdminSidebar />

          <section className="admin-main" aria-label="Answers list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem' }}>All Answers ({answers.length})</h3>
            </div>

            <div className="admin-table-card table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Answer Content</th>
                    <th>Author</th>
                    <th>Question</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((a) => (
                    <tr key={a._id}>
                      <td style={{ maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.body}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{a.author?.username || 'Anonymous'}</td>
                      <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.question ? (
                          <Link to={`/questions/${a.question._id}`} style={{ fontWeight: 500, color: 'var(--ink-800)' }}>
                            {a.question.title}
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Deleted Question</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(a.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          {a.question && (
                            <Link to={`/questions/${a.question._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 10px' }}
                            aria-label="Delete answer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {answers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                        No answers posted yet.
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

export default ManageAnswers;
