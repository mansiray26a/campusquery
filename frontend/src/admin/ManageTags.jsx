import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminSidebar from './AdminSidebar';
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
      setTags(data || []);
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
      return setError('Please provide both a tag name and a description.');
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
          <h2>Manage Course Tags</h2>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <div className="admin-grid">
          <AdminSidebar />

          <section className="admin-main" aria-label="Course tag management">
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <h4>Create New Course Tag</h4>
              <form onSubmit={handleCreateTag} className="tag-create-form" style={{ marginTop: 'var(--space-4)', background: 'none', border: 'none', padding: 0 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="tag-name">Tag Identifier</label>
                  <input
                    id="tag-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. cs-101"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label" htmlFor="tag-desc">Course / Subject Scope</label>
                  <input
                    id="tag-desc"
                    type="text"
                    className="form-input"
                    placeholder="Brief description of the course or topic..."
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
                        <span className="tag-badge" style={{ margin: 0, fontSize: '0.82rem' }}>
                          {t.name}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{t.description}</td>
                      <td>{t.questionCount || 0} questions</td>
                      <td>
                        <button
                          onClick={() => handleDeleteTag(t._id, t.name)}
                          className="btn btn-danger btn-sm"
                          style={{ padding: '4px 10px' }}
                          aria-label={`Delete tag ${t.name}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tags.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                        No course tags configured yet.
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

export default ManageTags;
