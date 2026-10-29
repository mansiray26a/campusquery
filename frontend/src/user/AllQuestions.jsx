import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuestionCard from '../components/QuestionCard';
import * as questionService from '../services/questionService';
import * as adminService from '../services/adminService';
import '../styles/questions.css';

const AllQuestions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions]       = useState([]);
  const [tags, setTags]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const searchQuery = searchParams.get('search') || '';
  const tagFilter   = searchParams.get('tag')    || '';
  const sortFilter  = searchParams.get('sort')   || 'newest';
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [qData, tData] = await Promise.all([
          questionService.getAllQuestions({ search: searchQuery, tag: tagFilter, sort: sortFilter }),
          adminService.getTags()
        ]);
        setQuestions(qData.questions);
        setTags(tData.slice(0, 14));
      } catch (err) {
        setError('Failed to load questions. Please check your connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [searchQuery, tagFilter, sortFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchInput, tag: tagFilter, sort: sortFilter });
  };

  const handleSort = (val) => setSearchParams({ search: searchQuery, tag: tagFilter, sort: val });
  const handleTag  = (t)   => setSearchParams({ search: searchQuery, tag: t, sort: sortFilter });

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasFilters = tagFilter || searchQuery;

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {/* Page header */}
        <div className="questions-header">
          <div>
            <h2 style={{ marginBottom: 0 }}>All Questions</h2>
            {!loading && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: 4 }}>
                {questions.length} {questions.length === 1 ? 'question' : 'questions'} found
              </p>
            )}
          </div>
          <Link to="/ask" className="btn btn-primary">
            Ask a Question
          </Link>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        {/* Search + Sort */}
        <div className="questions-header" style={{ marginBottom: 'var(--space-4)' }}>
          <form className="search-box" onSubmit={handleSearchSubmit} role="search" aria-label="Search questions">
            <input
              type="search"
              className="form-input search-input"
              placeholder="Search questions…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search query"
            />
            <button type="submit" className="btn btn-primary search-submit">Search</button>
          </form>

          <div className="sort-filters" role="group" aria-label="Sort questions">
            {['newest', 'votes', 'views'].map(s => (
              <button
                key={s}
                className={`sort-btn${sortFilter === s ? ' active' : ''}`}
                onClick={() => handleSort(s)}
                aria-pressed={sortFilter === s}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Active filters strip */}
        {hasFilters && (
          <div className="active-filters" role="status" aria-live="polite">
            <span>Filtering by:&nbsp;</span>
            {tagFilter && <span className="filter-chip">tag: <strong>{tagFilter}</strong></span>}
            {searchQuery && <span className="filter-chip">search: <strong>&ldquo;{searchQuery}&rdquo;</strong></span>}
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} aria-label="Clear all filters">
              Clear
            </button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="questions-layout">
          {/* Questions feed */}
          <div className="questions-feed">
            {loading ? (
              <div className="loading-spinner" aria-label="Loading questions">Loading questions…</div>
            ) : questions.length > 0 ? (
              questions.map(q => <QuestionCard key={q._id} question={q} />)
            ) : (
              <div className="empty-state">
                <h3>No questions found</h3>
                <p>Try a different search term or remove the tag filter.</p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                  {hasFilters && (
                    <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
                  )}
                  <Link to="/ask" className="btn btn-primary">Ask a Question</Link>
                </div>
              </div>
            )}
          </div>

          {/* Tags sidebar */}
          <aside className="sidebar-tags" aria-label="Filter by tag">
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)'
              }}>
                Filter by Tag
              </h3>
              <div className="sidebar-tag-list">
                {tags.map(tag => (
                  <button
                    key={tag._id}
                    className={`tag-badge${tagFilter === tag.name ? ' active-tag' : ''}`}
                    onClick={() => tagFilter === tag.name ? handleTag('') : handleTag(tag.name)}
                    aria-pressed={tagFilter === tag.name}
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {tag.name}
                    {tag.questionCount > 0 && (
                      <span style={{ color: 'var(--stone-400)', marginLeft: 3, fontSize: '0.7rem' }}>
                        {tag.questionCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {tags.length === 0 && !loading && (
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No tags found</p>
              )}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllQuestions;
