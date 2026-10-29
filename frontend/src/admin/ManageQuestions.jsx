import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminSidebar from './AdminSidebar';
import * as questionService from '../services/questionService';
import '../styles/adminDashboard.css';
import '../styles/manageQuestions.css';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchQuestions = async () => {
    try {
      const data = await questionService.getAllQuestions();
      setQuestions(data.questions || []);
    } catch (err) {
      setError('Failed to fetch questions registry.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (qId, title) => {
    if (window.confirm(`Are you sure you want to delete the question: "${title}"?`)) {
      setError('');
      setSuccess('');
      try {
        await questionService.deleteQuestion(qId);
        setSuccess('Question deleted successfully.');
        fetchQuestions();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete question.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading questions database...</div>
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
          <h2>Manage Questions</h2>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <div className="admin-grid">
          <AdminSidebar />

          <section className="admin-main" aria-label="Questions list">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem' }}>All Questions ({questions.length})</h3>
            </div>

            <div className="admin-table-card table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Tags</th>
                    <th>Votes</th>
                    <th>Views</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q._id}>
                      <td style={{ maxWidth: '280px' }}>
                        <Link to={`/questions/${q._id}`} style={{ fontWeight: 600, color: 'var(--ink-800)' }}>
                          {q.title}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{q.author?.username || 'Anonymous'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {q.tags && q.tags.map((t) => (
                            <span key={t._id || t.name} className="tag-badge" style={{ fontSize: '0.7rem', padding: '2px 6px', margin: 0 }}>
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{q.voteScore || 0}</td>
                      <td>{q.views || 0}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(q.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <Link to={`/questions/${q._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 10px' }}>
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(q._id, q.title)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 10px' }}
                            aria-label={`Delete ${q.title}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                        No questions in the database.
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

export default ManageQuestions;
