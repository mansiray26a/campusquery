import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/questions.css';

/* SVG icons ------------------------------------------------- */
const IconUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const IconDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ----------------------------------------------------------- */

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
  const [editBody, setEditBody]   = useState(body);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleUpdate = () => {
    if (!editBody.trim()) return;
    onEdit(_id, editBody);
    setIsEditing(false);
  };

  const isUpvoted       = currentUser ? upvotes.includes(currentUser._id)   : false;
  const isDownvoted     = currentUser ? downvotes.includes(currentUser._id)  : false;
  const isQuestionOwner = currentUser ? currentUser._id === questionAuthorId : false;
  const isAnswerOwner   = currentUser ? currentUser._id === author?._id      : false;
  const isAdmin         = currentUser?.role === 'admin';

  return (
    <div className={`answer-card${isAccepted ? ' accepted-answer-border' : ''}`} role="article" aria-label={`Answer by ${author?.username ?? 'Anonymous'}`}>
      <div className="answer-grid">
        {/* Vote panel */}
        <div className="qd-vote-panel" aria-label="Voting controls">
          <button
            className={`vote-arrow${isUpvoted ? ' voted' : ''}`}
            onClick={() => onVote(_id, 'upvote')}
            aria-label="Upvote this answer"
            aria-pressed={isUpvoted}
            disabled={!currentUser}
          >
            <IconUp />
          </button>
          <span className="vote-count" aria-label={`${voteScore} votes`}>{voteScore}</span>
          <button
            className={`vote-arrow${isDownvoted ? ' voted-down' : ''}`}
            onClick={() => onVote(_id, 'downvote')}
            aria-label="Downvote this answer"
            aria-pressed={isDownvoted}
            disabled={!currentUser}
          >
            <IconDown />
          </button>

          {isAccepted ? (
            <span className="accepted-check-icon" title="Accepted as best answer" aria-label="Best answer">
              <IconCheck />
            </span>
          ) : (
            isQuestionOwner && (
              <button
                className="accept-btn"
                onClick={() => onAccept(_id)}
                title="Mark as best answer"
                aria-label="Accept this answer as best"
              >
                <IconCheck />
              </button>
            )
          )}
        </div>

        {/* Content */}
        <div className="q-content">
          {isEditing ? (
            <div className="answer-edit-form">
              <textarea
                className="form-textarea"
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                rows={8}
                aria-label="Edit your answer"
              />
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                <button className="btn btn-primary btn-sm" onClick={handleUpdate}>Save changes</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="qd-body">{body}</div>

              <div className="q-footer" style={{ marginTop: 'var(--space-4)' }}>
                <div className="qd-actions">
                  {currentUser && (
                    <>
                      {(isAnswerOwner || isAdmin) && (
                        <>
                          <button className="qd-action-btn" onClick={() => setIsEditing(true)}>Edit</button>
                          <button
                            className="qd-action-btn"
                            onClick={() => onDelete(_id)}
                            style={isAdmin && !isAnswerOwner ? { color: 'var(--danger)', fontWeight: 600 } : {}}
                            title={isAdmin && !isAnswerOwner ? 'Admin: force delete' : 'Delete your answer'}
                          >
                            {isAdmin && !isAnswerOwner ? 'Admin delete' : 'Delete'}
                          </button>
                        </>
                      )}
                      {!isAnswerOwner && !isAdmin && (
                        <button className="qd-action-btn" onClick={() => onReport(_id)}>Report</button>
                      )}
                      {isQuestionOwner && isAccepted && (
                        <button
                          className="qd-action-btn"
                          onClick={() => onAccept(_id)}
                          style={{ color: 'var(--danger)' }}
                        >
                          Unaccept
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className="q-meta">
                  Answered by{' '}
                  {author ? (
                    <Link to={`/profile/${author._id}`} className="q-author-link">
                      {author.username}
                    </Link>
                  ) : 'Anonymous'}
                  {author && (
                    <span className="navbar-rep" style={{ fontSize: '0.7rem', padding: '1px 6px', marginLeft: 4 }}>
                      &#9733; {author.reputation || 0}
                    </span>
                  )}
                  {' · '}
                  <time dateTime={createdAt}>{formatDate(createdAt)}</time>
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
