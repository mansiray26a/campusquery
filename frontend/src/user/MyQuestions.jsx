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
        setQuestions(data.questions);
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
        <h2>My Questions</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Manage and review queries you have submitted on the platform.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="questions-feed" style={{ maxWidth: '850px' }}>
          {questions.length > 0 ? (
            questions.map((q) => (
              <QuestionCard key={q._id} question={q} />
            ))
          ) : (
            <div className="empty-state">
              <h3>You haven't asked any questions yet</h3>
              <p style={{ marginTop: '8px' }}>Need help with code, assignments, or campus queries?</p>
              <Link to="/ask" className="btn btn-primary" style={{ marginTop: '16px' }}>
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
