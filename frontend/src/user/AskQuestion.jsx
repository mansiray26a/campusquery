import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as questionService from '../services/questionService';
import '../styles/questions.css';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim() || !body.trim()) {
      return setError('Please provide a title, a short summary description, and a detailed body.');
    }

    setLoading(true);

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag !== '');

    try {
      const created = await questionService.createQuestion(title, description, body, tags);
      navigate(created?._id ? `/questions/${created._id}` : '/questions');
    } catch (err) {
      setError(err.message || 'Failed to submit question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <div className="ask-container animate-fade-up">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: 'var(--bronze)',
              marginBottom: 'var(--space-1)'
            }}>
              Academic Query
            </div>
            <h2>Ask a Question</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Pose a technical challenge, homework concept, or campus academic query to fellow students.
            </p>
          </div>

          <div className="ask-tip">
            <h4>Writing a great campus question:</h4>
            <ul>
              <li><strong>Descriptive Title:</strong> Mention specific concepts, tools, or course codes (e.g., <em>"Resolving segmentation fault in C++ linked list (CS-201)"</em>).</li>
              <li><strong>Brief Summary:</strong> A 1-2 sentence overview so peers can quickly recognize whether they can help.</li>
              <li><strong>Detailed Body:</strong> Include the code snippet, inputs tested, expected versus actual behavior, and full compiler/terminal messages.</li>
              <li><strong>Course Tags:</strong> Add comma-separated tags like <code>cs-101, algorithms, c++</code> for easy filtering.</li>
            </ul>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          <div className="card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="q-title">
                  Question Title <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="q-title"
                  type="text"
                  className="form-input"
                  placeholder="e.g. How to balance a Red-Black Tree in Java?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  required
                />
                <span className="form-hint">Be specific and frame your title like a question (max 150 chars).</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="q-desc">
                  Brief Summary (Description) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <input
                  id="q-desc"
                  type="text"
                  className="form-input"
                  placeholder="Summarize the core block in 1-2 sentences"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  required
                />
                <span className="form-hint">Displayed in search results and feeds (max 300 chars).</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="q-body">
                  Detailed Explanation &amp; Code <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <textarea
                  id="q-body"
                  className="form-textarea"
                  placeholder="Provide context, full details, console logs, and reproducible code..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={9}
                  required
                />
                <span className="form-hint">Provide everything needed for another student to reproduce and solve the issue.</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="q-tags">
                  Course &amp; Subject Tags
                </label>
                <input
                  id="q-tags"
                  type="text"
                  className="form-input"
                  placeholder="e.g. cs-101, algorithms, binary-trees"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
                <span className="form-hint">Separate multiple tags with commas (up to 5 tags).</span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Submitting Question...' : 'Post Question'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AskQuestion;
