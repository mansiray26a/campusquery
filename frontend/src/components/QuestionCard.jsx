import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/questions.css';

const QuestionCard = ({ question }) => {
  const {
    _id,
    title,
    description,
    tags,
    voteScore,
    answersCount,
    views,
    author,
    createdAt,
    acceptedAnswer
  } = question;

  const isAccepted = !!acceptedAnswer;

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <article className="q-card" aria-label={`Question: ${title}`}>
      {/* Stats column */}
      <div className="q-stats" aria-label="Question statistics">
        <div className="q-stat-item">
          <span className="q-stat-val">{voteScore >= 0 ? voteScore : 0}</span>
          <span className="q-stat-lbl">votes</span>
        </div>
        <div className={`q-stat-item${isAccepted ? ' accepted' : ''}`} title={isAccepted ? 'Has accepted answer' : `${answersCount || 0} answers`}>
          <span className="q-stat-val">{answersCount || 0}</span>
          <span className="q-stat-lbl">{isAccepted ? 'solved' : 'answers'}</span>
        </div>
        <div className="q-stat-item">
          <span className="q-stat-val">{views || 0}</span>
          <span className="q-stat-lbl">views</span>
        </div>
      </div>

      {/* Content column */}
      <div className="q-content">
        <h3 className="q-title">
          <Link to={`/questions/${_id}`}>{title}</Link>
        </h3>
        {description && (
          <p className="q-desc">{description}</p>
        )}

        <div className="q-footer">
          <div className="q-tags" aria-label="Tags">
            {tags && tags.slice(0, 4).map((tag) => (
              <Link
                key={tag._id || tag.name}
                to={`/questions?tag=${tag.name}`}
                className="tag-badge"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <div className="q-meta">
            <span>
              Asked by{' '}
              {author ? (
                <Link to={`/profile/${author._id}`} className="q-author-link">
                  {author.username}
                </Link>
              ) : 'Anonymous'}
            </span>
            <span className="q-meta-sep" aria-hidden="true">·</span>
            <time dateTime={createdAt}>{formatDate(createdAt)}</time>
          </div>
        </div>
      </div>
    </article>
  );
};

export default QuestionCard;
