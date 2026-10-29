import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import QuestionCard from '../components/QuestionCard';
import * as questionService from '../services/questionService';
import '../styles/questions.css';

const MyQuestions = () => {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyQuestions = async () => {
      if (!user) return;
      try {
        const data = await questionService.getAllQuestions({ author: user._id });
        setQuestions(data.questions || []);
      } catch (err) {
        setError('Failed to load your questions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyQuestions();
  }, [user]);

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading your queries...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)'
        }}>
          <div>
            <div style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              color: 'var(--bronze)',
              marginBottom: 'var(--space-1)'
            }}>
              Contributions
            </div>
            <h2>My Questions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage and track queries you have posted to the platform.
            </p>
          </div>
          <Link to="/ask" className="btn btn-primary">
            Ask a Question
          </Link>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}

        <div className="questions-feed" style={{ maxWidth: '850px' }}>
          {questions.length > 0 ? (
            questions.map((q) => (
              <QuestionCard key={q._id} question={q} />
            ))
          ) : (
            <div className="empty-state">
              <h3>You haven't asked any questions yet</h3>
              <p>Stuck on homework, lab code, or a conceptual problem?</p>
              <Link to="/ask" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                Ask a Question
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyQuestions;
