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
      return setError('Please fill in title, summary description, and details body');
    }

    setLoading(true);

    const tags = tagsInput
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag !== '');

    try {
      await questionService.createQuestion(title, description, body, tags);
      navigate('/questions');
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
        <div className="ask-container">
          <h2>Ask a Question</h2>
          
          <div className="ask-instructions">
            <h4>Formulating a good question:</h4>
            <ul>
              <li>Write a clear, descriptive title referencing the course or subject.</li>
              <li>Provide a concise summary in the description box.</li>
              <li>In the detailed body, describe what you have tried, share your code context, and specify errors.</li>
              <li>Add up to 5 course or technology tags, separated by commas.</li>
            </ul>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. How to balance a Red-Black Tree in Java?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Summary (Description)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Summarize your question in 1-2 sentences (max 300 characters)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={300}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Body</label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide all details, console outputs, and what you've tried..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (separated by commas)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. cs-101, trees, algorithms"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Posting...' : 'Post Question'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
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
