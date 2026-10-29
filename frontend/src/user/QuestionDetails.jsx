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

/* SVG Icons */
const IconBookmark = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const IconDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconSparkle = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

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
      setAnswers(data.answers || []);
      
      setEditTitle(data.question.title);
      setEditDesc(data.question.description);
      setEditBody(data.question.body);
      setEditTags(data.question.tags ? data.question.tags.map(t => t.name).join(', ') : '');
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
    if (!user) return navigate('/login');
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
    if (!user) return navigate('/login');
    try {
      const data = await authService.toggleSaveQuestion(id);
      setSuccess(data.isSaved ? 'Question bookmarked to your dashboard!' : 'Bookmark removed.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to toggle bookmark.');
    }
  };

  const handleReportQuestion = async () => {
    if (!user) return navigate('/login');
    const reason = window.prompt('Why are you reporting this question? (e.g. Inappropriate content, spam, incorrect course code)');
    if (reason === null) return;
    if (!reason.trim()) {
      return alert('A reason is required to submit a report.');
    }

    try {
      await adminService.submitReport('Question', id, reason);
      setSuccess('Question reported for moderation review.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    }
  };

  const handleDeleteQuestion = async () => {
    if (window.confirm('Are you sure you want to delete this question? This will also remove all associated answers.')) {
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
      fetchDetails();
      setSuccess('Question updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update question.');
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!answerBody.trim()) return;

    try {
      const newAnswer = await answerService.createAnswer(id, answerBody);
      setAnswers([...answers, newAnswer]);
      setAnswerBody('');
      setSuccess('Your answer has been posted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to post answer.');
    }
  };

  const handleVoteAnswer = async (ansId, voteType) => {
    if (!user) return navigate('/login');
    try {
      const data = await answerService.voteAnswer(ansId, voteType);
      setAnswers(answers.map((ans) => {
        if (ans._id === ansId) {
          return {
            ...ans,
            voteScore: data.voteScore,
            upvotes: data.upvotes,
            downvotes: data.downvotes
          };
        }
        return ans;
      }));
    } catch (err) {
      setError(err.message || 'Failed to vote on answer.');
    }
  };

  const handleAcceptAnswer = async (ansId) => {
    if (!user) return navigate('/login');
    try {
      const data = await answerService.acceptAnswer(ansId);
      setAnswers(answers.map((ans) => ({
        ...ans,
        isAccepted: ans._id === data.acceptedAnswerId
      })));
      setQuestion((prev) => ({
        ...prev,
        acceptedAnswer: data.acceptedAnswerId
      }));
      setSuccess('Accepted answer status updated.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to accept answer.');
    }
  };

  const handleDeleteAnswer = async (ansId) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await answerService.deleteAnswer(ansId);
        setAnswers(answers.filter((a) => a._id !== ansId));
        setSuccess('Answer deleted.');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete answer.');
      }
    }
  };

  const handleEditAnswer = async (ansId, newBody) => {
    try {
      const updated = await answerService.updateAnswer(ansId, newBody);
      setAnswers(answers.map((a) => (a._id === ansId ? { ...a, body: updated.body } : a)));
      setSuccess('Answer updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update answer.');
    }
  };

  const handleReportAnswer = async (ansId) => {
    if (!user) return navigate('/login');
    const reason = window.prompt('Why are you reporting this answer?');
    if (reason === null) return;
    if (!reason.trim()) return alert('A reason is required.');

    try {
      await adminService.submitReport('Answer', ansId, reason);
      setSuccess('Answer report submitted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    }
  };

  const handleAskAI = async () => {
    setAiVisible(true);
    setAiLoading(true);
    setAiError('');
    setAiAnswer('');
    try {
      const data = await aiService.getAIAnswer(id);
      setAiAnswer(data.answer);
    } catch (err) {
      setAiError(err.message || 'AI service unavailable. Verify server connection.');
    } finally {
      setAiLoading(false);
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
        <div className="loading-spinner">Loading question details...</div>
        <Footer />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <div className="empty-state">
            <h3>Question not found</h3>
            <p>This post may have been removed or the link is invalid.</p>
            <Link to="/questions" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
              Browse Questions
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isQuestionOwner = user?._id === question.author?._id;
  const isAdmin = user?.role === 'admin';
  const isUpvoted = user && question.upvotes ? question.upvotes.includes(user._id) : false;
  const isDownvoted = user && question.downvotes ? question.downvotes.includes(user._id) : false;

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <div className="qd-header">
          <h1 className="qd-title">{question.title}</h1>
          <div className="qd-submeta">
            <span>Asked <strong>{formatDate(question.createdAt)}</strong></span>
            <span>Viewed <strong>{question.views || 0} times</strong></span>
            <span>Author <strong>{question.author?.username || 'Anonymous'}</strong></span>
            {question.author?.reputation !== undefined && (
              <span className="navbar-rep" style={{ fontSize: '0.75rem', padding: '1px 7px' }}>
                &#9733; {question.author.reputation} rep
              </span>
            )}
          </div>
        </div>

        <div className="qd-grid">
          {/* Vote panel */}
          <div className="qd-vote-panel" aria-label="Question votes">
            <button
              className={`vote-arrow${isUpvoted ? ' voted' : ''}`}
              onClick={() => handleVoteQuestion('upvote')}
              aria-label="Upvote question"
              title="This question shows research effort and is clear"
            >
              <IconUp />
            </button>
            <span className="vote-count">{question.voteScore || 0}</span>
            <button
              className={`vote-arrow${isDownvoted ? ' voted-down' : ''}`}
              onClick={() => handleVoteQuestion('downvote')}
              aria-label="Downvote question"
              title="This question is unclear, off-topic, or lacks context"
            >
              <IconDown />
            </button>
            <button
              className="bookmark-icon"
              onClick={handleSaveQuestion}
              title="Bookmark question"
              aria-label="Save question"
            >
              <IconBookmark filled={false} />
            </button>
          </div>

          {/* Question content */}
          <div className="q-content">
            {isEditing ? (
              <form onSubmit={handleUpdateQuestion} className="card" style={{ padding: 'var(--space-6)' }}>
                <h3>Edit Question</h3>
                <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Brief Summary</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Detailed Body</label>
                  <textarea
                    className="form-textarea"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={8}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                  <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p style={{
                  fontSize: '1rem',
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-4)',
                  lineHeight: 1.6
                }}>
                  {question.description}
                </p>

                <div className="qd-body">
                  {question.body}
                </div>

                <div className="q-footer" style={{ marginTop: 'var(--space-5)' }}>
                  <div className="q-tags">
                    {question.tags && question.tags.map((t) => (
                      <Link key={t._id || t.name} to={`/questions?tag=${t.name}`} className="tag-badge">
                        {t.name}
                      </Link>
                    ))}
                  </div>

                  <div className="qd-actions">
                    <button
                      className="ai-ask-btn"
                      onClick={handleAskAI}
                      disabled={aiLoading}
                      title="Generate an AI response using Groq LLM"
                    >
                      <IconSparkle /> {aiLoading ? 'Consulting AI...' : 'Ask AI'}
                    </button>

                    {user && (
                      <>
                        {(isQuestionOwner || isAdmin) && (
                          <>
                            <button className="qd-action-btn" onClick={() => setIsEditing(true)}>
                              Edit
                            </button>
                            <button
                              className="qd-action-btn"
                              onClick={handleDeleteQuestion}
                              style={isAdmin && !isQuestionOwner ? { color: 'var(--danger)', fontWeight: 600 } : {}}
                            >
                              <IconTrash /> {isAdmin && !isQuestionOwner ? 'Admin Delete' : 'Delete'}
                            </button>
                          </>
                        )}
                        {!isQuestionOwner && !isAdmin && (
                          <button className="qd-action-btn" onClick={handleReportQuestion}>
                            Report
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* AI Answer Section */}
        {aiVisible && (
          <div className="ai-answer-card">
            <div className="ai-answer-header">
              <span className="ai-badge">AI Response</span>
              <span className="ai-model-label">Groq Llama-3 8B Campus Assistant</span>
              <button
                className="ai-close-btn"
                onClick={() => { setAiVisible(false); setAiAnswer(''); setAiError(''); }}
                title="Close AI response"
                aria-label="Close AI card"
              >
                ✕
              </button>
            </div>

            {aiLoading && (
              <div className="ai-loading">
                <div className="ai-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span>Analyzing question and generating solution...</span>
              </div>
            )}

            {aiError && !aiLoading && (
              <div className="alert alert-danger" style={{ margin: 'var(--space-2) 0 0' }}>
                {aiError}
              </div>
            )}

            {aiAnswer && !aiLoading && (
              <div className="ai-answer-body">
                <div className="ai-disclaimer">
                  <strong>Campus AI Note:</strong> AI generated answers provide general guidance. Always verify academic formulas and code with your professor or course curriculum.
                </div>
                <pre className="ai-answer-text">{aiAnswer}</pre>
              </div>
            )}
          </div>
        )}

        {/* Answers List */}
        <section className="answers-section" aria-label="Community answers">
          <div className="answers-header">
            <h3>{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</h3>
          </div>

          {answers.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
              <h3>No answers yet</h3>
              <p>Know how to solve this? Be the first to share an answer below.</p>
            </div>
          ) : (
            answers.map((ans) => (
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
            ))
          )}

          {/* Post Answer Form */}
          <div className="card answer-form" style={{ marginTop: 'var(--space-8)' }}>
            {user ? (
              <form onSubmit={handlePostAnswer}>
                <h4>
                  {isQuestionOwner ? 'Post a Follow-Up Solution' : 'Your Answer'}
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 'var(--space-3)' }}>
                  Provide a clear, reproducible solution with code or references where applicable.
                </p>
                <textarea
                  className="form-textarea"
                  placeholder="Write your explanation or code here..."
                  value={answerBody}
                  onChange={(e) => setAnswerBody(e.target.value)}
                  rows={8}
                  required
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                  <button type="submit" className="btn btn-primary">
                    Post Your Answer
                  </button>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Posting as <strong>{user.username}</strong>
                  </span>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <h4>Sign in to contribute an answer</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 'var(--space-2) auto var(--space-4)', maxWidth: '400px' }}>
                  Join CampusQuery to post your answer, earn reputation, and help fellow students.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
                  <Link to="/login" className="btn btn-primary">Sign In</Link>
                  <Link to="/register" className="btn btn-secondary">Create Account</Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default QuestionDetails;
