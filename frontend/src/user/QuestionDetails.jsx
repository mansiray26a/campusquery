import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AnswerCard from '../components/AnswerCard';
import * as questionService from '../services/questionService';
import * as answerService from '../services/answerService';
import * as adminService from '../services/adminService';
import * as authService from '../services/authService';
import * as aiService from '../services/aiService';
import '../styles/questions.css';

const QuestionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [answerBody, setAnswerBody] = useState('');

  // AI Answer States
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiVisible, setAiVisible] = useState(false);

  // Edit Question States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editTags, setEditTags] = useState('');

  const fetchDetails = async () => {
    try {
      const data = await questionService.getQuestionDetails(id);
      setQuestion(data.question);
      setAnswers(data.answers);
      
      setEditTitle(data.question.title);
      setEditDesc(data.question.description);
      setEditBody(data.question.body);
      setEditTags(data.question.tags.map(t => t.name).join(', '));
    } catch (err) {
      setError('Failed to load question details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleVoteQuestion = async (voteType) => {
    if (!user) {
      return navigate('/login');
    }
    try {
      const data = await questionService.voteQuestion(id, voteType);
      setQuestion((prev) => ({
        ...prev,
        voteScore: data.voteScore,
        upvotes: data.upvotes,
        downvotes: data.downvotes
      }));
    } catch (err) {
      setError(err.message || 'Failed to register vote.');
    }
  };

  const handleSaveQuestion = async () => {
    if (!user) {
      return navigate('/login');
    }
    try {
      const data = await authService.toggleSaveQuestion(id);
      setSuccess(data.isSaved ? 'Question bookmarked successfully!' : 'Question bookmark removed.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to toggle bookmark.');
    }
  };

  const handleReportQuestion = async () => {
    if (!user) {
      return navigate('/login');
    }
    const reason = window.prompt('Why are you reporting this question? (e.g. Off-topic, inappropriate language)');
    if (reason === null) return;
    if (!reason.trim()) {
      return alert('A reason is required to submit a report.');
    }

    try {
      await adminService.submitReport('Question', id, reason);
      setSuccess('Question report submitted successfully for review.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    }
  };

  const handleDeleteQuestion = async () => {
    if (window.confirm('Are you sure you want to delete this question? This will permanently delete all associated answers.')) {
      try {
        await questionService.deleteQuestion(id);
        navigate('/questions');
      } catch (err) {
        setError(err.message || 'Failed to delete question.');
      }
    }
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    setError('');

    const tagsArr = editTags
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t !== '');

    try {
      const updated = await questionService.updateQuestion(id, editTitle, editDesc, editBody, tagsArr);
      setQuestion(updated);
      setIsEditing(false);
      fetchDetails(); // Reload details with populated tag objects
      setSuccess('Question updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update question.');
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!user) {
      return navigate('/login');
    }
    if (!answerBody.trim()) {
      return setError('Answer cannot be empty.');
    }

    try {
      await answerService.createAnswer(answerBody, id);
      setAnswerBody('');
      fetchDetails(); // Reload answers
      setSuccess('Answer posted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to post answer.');
    }
  };

  const handleVoteAnswer = async (answerId, voteType) => {
    if (!user) {
      return navigate('/login');
    }
    try {
      await answerService.voteAnswer(answerId, voteType);
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Failed to vote on answer.');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await answerService.acceptAnswer(answerId);
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Failed to update answer acceptance state.');
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await answerService.deleteAnswer(answerId);
        fetchDetails();
      } catch (err) {
        setError(err.message || 'Failed to delete answer.');
      }
    }
  };

  const handleEditAnswer = async (answerId, newBody) => {
    try {
      await answerService.updateAnswer(answerId, newBody);
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Failed to update answer.');
    }
  };

  const handleReportAnswer = async (answerId) => {
    if (!user) {
      return navigate('/login');
    }
    const reason = window.prompt('Why are you reporting this answer?');
    if (reason === null) return;
    if (!reason.trim()) {
      return alert('A reason is required to submit a report.');
    }

    try {
      await adminService.submitReport('Answer', answerId, reason);
      setSuccess('Answer report submitted successfully for moderation.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    }
  };

  const handleGetAIAnswer = async () => {
    if (!user) return navigate('/login');
    setAiVisible(true);
    setAiLoading(true);
    setAiError('');
    setAiAnswer('');
    try {
      const data = await aiService.getAIAnswer(id);
      setAiAnswer(data.answer);
    } catch (err) {
      setAiError(err.message || 'AI failed to generate an answer. Please try again.');
    } finally {
      setAiLoading(false);
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
        <div className="loading-spinner">Loading question details...</div>
        <Footer />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="empty-state">Question not found.</div>
        <Footer />
      </div>
    );
  }

  const isUpvoted = user ? question.upvotes.includes(user._id) : false;
  const isDownvoted = user ? question.downvotes.includes(user._id) : false;
  const isQuestionOwner = user ? user._id === question.author?._id : false;
  const isAdmin = user ? user.role === 'admin' : false;

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {isEditing ? (
          <div className="card">
            <h3>Edit Question</h3>
            <form onSubmit={handleUpdateQuestion} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={150}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Brief Summary (Description)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  maxLength={300}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Body Details</label>
                <textarea
                  className="form-textarea"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (separated by commas)</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div className="qd-header">
              <h1 className="qd-title">{question.title}</h1>
              <div className="qd-submeta">
                <span>Asked <strong>{formatDate(question.createdAt)}</strong></span>
                <span>Active <strong>{question.views} views</strong></span>
                <span>Author <strong>{question.author?.username || 'Anonymous'} (🏆{question.author?.reputation || 0})</strong></span>
              </div>
            </div>

            <div className="qd-grid">
              <div className="qd-vote-panel">
                <button
                  className={`vote-arrow ${isUpvoted ? 'voted' : ''}`}
                  onClick={() => handleVoteQuestion('upvote')}
                  title="Upvote Question"
                >
                  ▲
                </button>
                <span className="vote-count">{question.voteScore}</span>
                <button
                  className={`vote-arrow ${isDownvoted ? 'voted' : ''}`}
                  onClick={() => handleVoteQuestion('downvote')}
                  title="Downvote Question"
                >
                  ▼
                </button>

                <button
                  className="bookmark-icon"
                  onClick={handleSaveQuestion}
                  title="Bookmark Question"
                >
                  🔖
                </button>
              </div>

              <div className="q-content">
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>
                  {question.description}
                </p>
                <div className="qd-body">{question.body}</div>

                <div className="q-footer" style={{ marginTop: '20px' }}>
                  <div className="q-tags">
                    {question.tags.map((t) => (
                      <Link key={t._id} to={`/questions?tag=${t.name}`} className="tag-badge">
                        {t.name}
                      </Link>
                    ))}
                  </div>

                  <div className="qd-actions">
                    {user && (
                      <>
                        {/* AI Answer Button */}
                        <button
                          className="qd-action-btn ai-ask-btn"
                          onClick={handleGetAIAnswer}
                          disabled={aiLoading}
                          title="Get an AI-generated answer for this question"
                        >
                          {aiLoading ? '⏳ Thinking...' : '✨ Ask AI'}
                        </button>

                        {(isQuestionOwner || isAdmin) && (
                          <>
                            <button className="qd-action-btn" onClick={() => setIsEditing(true)}>
                              Edit
                            </button>
                            <button className="qd-action-btn" onClick={handleDeleteQuestion} style={{ color: 'var(--danger)' }}>
                              Delete
                            </button>
                          </>
                        )}
                        {!isQuestionOwner && (
                          <button className="qd-action-btn" onClick={handleReportQuestion}>
                            Report
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="answers-section">
              {/* ── AI Answer Card ── */}
              {aiVisible && (
                <div className="ai-answer-card">
                  <div className="ai-answer-header">
                    <span className="ai-badge">✨ AI Answer</span>
                    <span className="ai-model-label">Powered by Groq · llama3-8b</span>
                    <button
                      className="ai-close-btn"
                      onClick={() => { setAiVisible(false); setAiAnswer(''); setAiError(''); }}
                      title="Dismiss AI answer"
                    >
                      ✕
                    </button>
                  </div>

                  {aiLoading && (
                    <div className="ai-loading">
                      <span className="ai-dots"><span /><span /><span /></span>
                      <p>Generating a grounded answer — this may take a few seconds…</p>
                    </div>
                  )}

                  {aiError && !aiLoading && (
                    <div className="alert alert-danger" style={{ margin: '12px 0 0' }}>
                      {aiError}
                    </div>
                  )}

                  {aiAnswer && !aiLoading && (
                    <div className="ai-answer-body">
                      <div className="ai-disclaimer">
                        ⚠️ <strong>AI-generated — always verify with your course material or instructor.</strong>
                      </div>
                      <pre className="ai-answer-text">{aiAnswer}</pre>
                    </div>
                  )}
                </div>
              )}

              <h3 className="answers-header">{answers.length} Answers</h3>
              {answers.map((ans) => (
                <AnswerCard
                  key={ans._id}
                  answer={ans}
                  currentUser={user}
                  questionAuthorId={question.author?._id}
                  onVote={handleVoteAnswer}
                  onAccept={handleAcceptAnswer}
                  onDelete={handleDeleteAnswer}
                  onEdit={handleEditAnswer}
                  onReport={handleReportAnswer}
                />
              ))}

              {/* ── Answer Form Section ── */}
              <div className="card answer-form" style={{ marginTop: '30px' }}>
                {user ? (
                  <>
                    <h4>
                      {isQuestionOwner
                        ? '💬 Post Your Own Answer'
                        : '✍️ Your Answer'}
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px' }}>
                      Share your knowledge and help the community. Be specific and concise.
                    </p>
                    <form onSubmit={handlePostAnswer} style={{ marginTop: '12px' }}>
                      <textarea
                        className="form-textarea"
                        placeholder="Write a detailed, constructive answer. Include code snippets or examples if helpful..."
                        value={answerBody}
                        onChange={(e) => setAnswerBody(e.target.value)}
                        rows={8}
                        required
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                        <button type="submit" className="btn btn-primary">
                          🚀 Post Your Answer
                        </button>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Logged in as <strong>{user.username}</strong>
                        </span>
                      </div>
                    </form>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-secondary)' }}>
                      🔐 You need to be logged in to post an answer.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                      <a href="/login" className="btn btn-primary">Login to Answer</a>
                      <a href="/register" className="btn btn-secondary">Create Account</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default QuestionDetails;
