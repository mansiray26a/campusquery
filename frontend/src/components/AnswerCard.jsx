import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/questions.css';

const AnswerCard = ({
  answer,
  currentUser,
  questionAuthorId,
  onVote,
  onAccept,
  onDelete,
  onEdit,
  onReport
}) => {
  const { _id, body, voteScore, upvotes = [], downvotes = [], isAccepted, author, createdAt } = answer;
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(body);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleUpdate = () => {
    if (!editBody.trim()) return;
    onEdit(_id, editBody);
    setIsEditing(false);
  };

  const isUpvoted = currentUser ? upvotes.includes(currentUser._id) : false;
  const isDownvoted = currentUser ? downvotes.includes(currentUser._id) : false;
  const isQuestionOwner = currentUser ? currentUser._id === questionAuthorId : false;
  const isAnswerOwner = currentUser ? currentUser._id === author?._id : false;
  const isAdmin = currentUser ? currentUser.role === 'admin' : false;

  return (
    <div className={`answer-card ${isAccepted ? 'accepted-answer-border' : ''}`}>
      <div className="answer-grid">
        <div className="qd-vote-panel">
          <button
            className={`vote-arrow ${isUpvoted ? 'voted' : ''}`}
            onClick={() => onVote(_id, 'upvote')}
            title="Upvote Answer"
          >
            ▲
          </button>
          <span className="vote-count">{voteScore}</span>
          <button
            className={`vote-arrow ${isDownvoted ? 'voted' : ''}`}
            onClick={() => onVote(_id, 'downvote')}
            title="Downvote Answer"
          >
            ▼
          </button>

          {isAccepted ? (
            <span className="accepted-check-icon" title="Accepted as Best Solution">✔</span>
          ) : (
            isQuestionOwner && (
              <button
                className="accept-btn"
                onClick={() => onAccept(_id)}
                title="Mark as Best Solution"
              >
                ✓
              </button>
            )
          )}
        </div>

        <div className="q-content">
          {isEditing ? (
            <div className="answer-edit-form">
              <textarea
                className="form-textarea"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary btn-sm" onClick={handleUpdate}>
                  Save
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="qd-body">{body}</div>
              
              <div className="q-footer" style={{ marginTop: '16px' }}>
                <div className="qd-actions">
                  {currentUser && (
                    <>
                      {(isAnswerOwner || isAdmin) && (
                        <>
                          <button className="qd-action-btn" onClick={() => setIsEditing(true)}>
                            Edit
                          </button>
                          <button className="qd-action-btn" onClick={() => onDelete(_id)}>
                            Delete
                          </button>
                        </>
                      )}
                      {!isAnswerOwner && (
                        <button className="qd-action-btn" onClick={() => onReport(_id)}>
                          Report
                        </button>
                      )}
                    </>
                  )}
                  {isQuestionOwner && isAccepted && (
                    <button className="qd-action-btn" onClick={() => onAccept(_id)} style={{ color: 'var(--danger)', fontWeight: '600' }}>
                      Unaccept
                    </button>
                  )}
                </div>

                <div className="q-meta">
                  Answered by{' '}
                  {author ? (
                    <>
                      <Link to={`/profile/${author._id}`} className="q-author-link">
                        {author.username}
                      </Link>{' '}
                      <span className="navbar-rep" style={{ fontSize: '0.7rem', padding: '1px 5px' }}>
                        🏆 {author.reputation || 0}
                      </span>
                    </>
                  ) : (
                    'Anonymous'
                  )}
                  {' '}on {formatDate(createdAt)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerCard;
