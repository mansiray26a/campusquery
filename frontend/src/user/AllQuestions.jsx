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
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const searchQuery = searchParams.get('search') || '';
  const tagFilter = searchParams.get('tag') || '';
  const sortFilter = searchParams.get('sort') || 'newest';

  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    const fetchQuestionsAndTags = async () => {
      setLoading(true);
      try {
        const qData = await questionService.getAllQuestions({
          search: searchQuery,
          tag: tagFilter,
          sort: sortFilter
        });
        setQuestions(qData.questions);

        const tData = await adminService.getTags();
        setTags(tData);
      } catch (err) {
        setError('Failed to fetch questions. Please check server connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndTags();
  }, [searchQuery, tagFilter, sortFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({
      search: searchInput,
      tag: tagFilter,
      sort: sortFilter
    });
  };

  const handleSortChange = (newSort) => {
    setSearchParams({
      search: searchQuery,
      tag: tagFilter,
      sort: newSort
    });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <div className="questions-header">
          <h2>All Questions</h2>
          <Link to="/ask" className="btn btn-primary">
            Ask a Question
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="questions-header">
          <form className="search-box" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search questions by text..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
              Go
            </button>
          </form>

          <div className="sort-filters">
            <button
              className={`sort-btn ${sortFilter === 'newest' ? 'active' : ''}`}
              onClick={() => handleSortChange('newest')}
            >
              Newest
            </button>
            <button
              className={`sort-btn ${sortFilter === 'votes' ? 'active' : ''}`}
              onClick={() => handleSortChange('votes')}
            >
              Votes
            </button>
            <button
              className={`sort-btn ${sortFilter === 'views' ? 'active' : ''}`}
              onClick={() => handleSortChange('views')}
            >
              Views
            </button>
          </div>
        </div>

        {(tagFilter || searchQuery) && (
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Active filters: {tagFilter && <span>Tag: <strong>{tagFilter}</strong></span>} {searchQuery && <span>Text: <strong>"{searchQuery}"</strong></span>}
            </span>
            <button className="btn btn-secondary btn-sm" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        )}

        <div className="questions-layout">
          <div className="questions-feed">
            {loading ? (
              <div className="loading-spinner">Loading matching queries...</div>
            ) : questions.length > 0 ? (
              questions.map((q) => (
                <QuestionCard key={q._id} question={q} />
              ))
            ) : (
              <div className="empty-state">
                <h3>No Questions Found</h3>
                <p style={{ marginTop: '8px' }}>Try a different search query or clear the filter tags.</p>
                <button className="btn btn-secondary" onClick={clearFilters} style={{ marginTop: '16px' }}>
                  Reset Search
                </button>
              </div>
            )}
          </div>

          <div className="questions-sidebar">
            <div className="sidebar-box">
              <h4>Filter by Course Tag</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {tags && tags.map((t) => (
                  <Link
                    key={t._id}
                    to={`/questions?tag=${t.name}&search=${searchQuery}&sort=${sortFilter}`}
                    className={`tag-badge ${tagFilter === t.name ? 'active' : ''}`}
                    style={tagFilter === t.name ? { backgroundColor: 'var(--primary)', color: '#ffffff' } : {}}
                  >
                    {t.name} ({t.questionCount})
                  </Link>
                ))}
                {tags.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>No tags found.</span>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AllQuestions;
