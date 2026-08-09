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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isAccepted = !!acceptedAnswer;

  return (
    <div className="q-card">
      <div className="q-stats">
        <div className="q-stat-item">
          <span className="q-stat-val">{voteScore}</span>
          <span className="q-stat-lbl">votes</span>
        </div>
        <div className={`q-stat-item ${isAccepted ? 'accepted' : ''}`}>
          <span className="q-stat-val">{answersCount || 0}</span>
          <span className="q-stat-lbl">answers</span>
        </div>
        <div className="q-stat-item">
          <span className="q-stat-val">{views}</span>
          <span className="q-stat-lbl">views</span>
        </div>
      </div>

      <div className="q-content">
        <h3 className="q-title">
          <Link to={`/questions/${_id}`}>{title}</Link>
        </h3>
        <p className="q-desc">{description}</p>
        
        <div className="q-footer">
          <div className="q-tags">
            {tags && tags.map((tag) => (
              <Link key={tag._id || tag.name} to={`/questions?tag=${tag.name}`} className="tag-badge">
                {tag.name}
              </Link>
            ))}
          </div>
          
          <div className="q-meta">
            Asked by{' '}
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
      </div>
    </div>
  );
};

export default QuestionCard;
