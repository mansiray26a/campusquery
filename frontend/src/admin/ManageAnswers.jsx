import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
      setAnswers(data);
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
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
        <h2>Admin Portal</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="admin-grid">
          <div className="admin-sidebar">
            <Link to="/admin" className="admin-nav-item">📊 Stats Overview</Link>
            <Link to="/admin/users" className="admin-nav-item">👥 Manage Users</Link>
            <Link to="/admin/questions" className="admin-nav-item">❓ Manage Questions</Link>
            <Link to="/admin/answers" className="admin-nav-item active">💬 Manage Answers</Link>
            <Link to="/admin/tags" className="admin-nav-item">🏷️ Manage Tags</Link>
            <Link to="/admin/reports" className="admin-nav-item">🚨 Reports Review</Link>
          </div>

          <div className="admin-main">
            <h3>Manage Answers</h3>
            <div className="admin-table-card table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Answer Summary</th>
                    <th>Author</th>
                    <th>Question</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((a) => (
                    <tr key={a._id}>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.body}
                      </td>
                      <td>{a.author?.username || 'Anonymous'}</td>
                      <td>
                        {a.question ? (
                          <Link to={`/questions/${a.question._id}`} style={{ fontWeight: '500', color: 'var(--secondary)' }}>
                            {a.question.title}
                          </Link>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Deleted Question</span>
                        )}
                      </td>
                      <td>{formatDate(a.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {a.question && (
                            <Link to={`/questions/${a.question._id}`} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(a._id)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {answers.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No answers posted yet.
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

export default ManageAnswers;
