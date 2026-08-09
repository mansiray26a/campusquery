import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as adminService from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/manageQuestions.css';

const ManageTags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const fetchTags = async () => {
    try {
      const data = await adminService.getTags();
      setTags(data);
    } catch (err) {
      setError('Failed to fetch tag catalog.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreateTag = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !description.trim()) {
      return setError('Please fill in tag name and description.');
    }

    try {
      await adminService.createTag(name, description);
      setSuccess(`Tag "${name}" created successfully.`);
      setName('');
      setDescription('');
      fetchTags();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create tag.');
    }
  };

  const handleDeleteTag = async (tagId, tagName) => {
    if (window.confirm(`Are you sure you want to delete tag: "${tagName}"? This will untag it from all questions.`)) {
      setError('');
      setSuccess('');
      try {
        await adminService.deleteTag(tagId);
        setSuccess(`Tag "${tagName}" deleted successfully.`);
        fetchTags();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete tag.');
      }
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading tags database...</div>
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
            <Link to="/admin/tags" className="admin-nav-item active">🏷️ Manage Tags</Link>
            <Link to="/admin/reports" className="admin-nav-item">🚨 Reports Review</Link>
          </div>

          <div className="admin-main">
            <h3>Manage Tags</h3>

            <div className="card" style={{ marginBottom: '24px' }}>
              <h4>Create New Course Tag</h4>
              <form onSubmit={handleCreateTag} className="tag-create-form" style={{ marginTop: '16px', background: 'none', border: 'none', padding: 0 }}>
                <div className="form-group">
                  <label className="form-label">Tag Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. cs-101"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Introduce course title or scope..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', height: 'fit-content' }}>
                  Create Tag
                </button>
              </form>
            </div>

            <div className="admin-table-card table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Tag Name</th>
                    <th>Description</th>
                    <th>Questions Count</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <span className="tag-badge" style={{ margin: 0, fontSize: '0.85rem' }}>
                          {t.name}
                        </span>
                      </td>
                      <td>{t.description}</td>
                      <td>📊 {t.questionCount} posts</td>
                      <td>
                        <button
                          onClick={() => handleDeleteTag(t._id, t.name)}
                          className="btn btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tags.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No catalog tags configured yet.
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

export default ManageTags;
