import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
      setQuestions(data.questions);
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
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <h2>Admin Portal</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="admin-grid">
          <div className="admin-sidebar">
            <Link to="/admin" className="admin-nav-item">📊 Stats Overview</Link>
            <Link to="/admin/users" className="admin-nav-item">👥 Manage Users</Link>
            <Link to="/admin/questions" className="admin-nav-item active">❓ Manage Questions</Link>
            <Link to="/admin/answers" className="admin-nav-item">💬 Manage Answers</Link>
            <Link to="/admin/tags" className="admin-nav-item">🏷️ Manage Tags</Link>
            <Link to="/admin/reports" className="admin-nav-item">🚨 Reports Review</Link>
          </div>

          <div className="admin-main">
            <h3>Manage Questions</h3>
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
                      <td>
                        <Link to={`/questions/${q._id}`} style={{ fontWeight: '600', color: 'var(--secondary)' }}>
                          {q.title}
                        </Link>
                      </td>
                      <td>{q.author?.username || 'Anonymous'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {q.tags.map(t => (
                            <span key={t._id} className="tag-badge" style={{ fontSize: '0.7rem', padding: '2px 6px', margin: 0 }}>
                              {t.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>{q.voteScore}</td>
                      <td>{q.views}</td>
                      <td>{formatDate(q.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link to={`/questions/${q._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(q._id, q.title)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No questions asked yet.
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

export default ManageQuestions;
