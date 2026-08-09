import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as adminService from '../services/adminService';
import '../styles/landing.css';

const LandingPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await adminService.getTags();
        setTags(data.slice(0, 8));
      } catch (err) {
        console.error('Failed to load tags:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <section className="hero-section">
          <h1 className="hero-title">
            Your College Knowledge Base <span>Platform</span>
          </h1>
          <p className="hero-subtitle">
            Welcome to CampusQuery! Ask questions, get help from fellow students, write code, share notes, and build up your academic reputation points.
          </p>
          <div className="hero-actions">
            <Link to="/questions" className="btn btn-primary">
              Browse Questions
            </Link>
            <Link to="/ask" className="btn btn-secondary">
              Ask a Question
            </Link>
          </div>
        </section>

        <section className="features-section">
          <div className="section-header">
            <h2>Why CampusQuery?</h2>
            <p>Designed specifically to help college students share knowledge and solve course assignments together.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">❓</div>
              <h3>Ask Questions</h3>
              <p>Stuck on an algorithms homework or a lab project? Describe it and get answers from students who took the course.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">🏆</div>
              <h3>Earn Reputation</h3>
              <p>Get recognized by your peers! Earn reputation points whenever your answers are upvoted or selected as the best solution.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">🏷️</div>
              <h3>Tag Categories</h3>
              <p>Browse by course codes like CS-101, EE-202, or general topics like machine learning, exams prep, and internships.</p>
            </div>
          </div>
        </section>

        <section className="how-it-works">
          <h2 style={{ textAlign: 'center' }}>How It Works</h2>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-num">1</div>
              <h4>Ask or Search</h4>
              <p>Search existing queries or create a new question detailing your technical block.</p>
            </div>
            <div className="step-item">
              <div className="step-num">2</div>
              <h4>Collaborate</h4>
              <p>Other students submit answers and reply with tips, links, and code snippets.</p>
            </div>
            <div className="step-item">
              <div className="step-num">3</div>
              <h4>Select Solution</h4>
              <p>Select the best response to mark it as resolved, awarding points to the author.</p>
            </div>
          </div>
        </section>

        <section className="popular-tags-section">
          <h2>Popular Course Tags</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Click a tag below to filter academic queries by subject</p>
          <div className="tags-cloud">
            {loading ? (
              <p>Loading course tags...</p>
            ) : tags.length > 0 ? (
              tags.map((tag) => (
                <Link key={tag._id} to={`/questions?tag=${tag.name}`} className="tag-badge" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  {tag.name} ({tag.questionCount})
                </Link>
              ))
            ) : (
              ['cs-101', 'data-structures', 'database-systems', 'algorithms', 'computer-networks', 'web-dev'].map((defaultTag) => (
                <Link key={defaultTag} to={`/questions?tag=${defaultTag}`} className="tag-badge" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                  {defaultTag}
                </Link>
              ))
            )}
          </div>
        </section>

        <section style={{ marginBottom: '64px' }}>
          <div className="section-header">
            <h2>Campus Activity Overview</h2>
            <p>Our growing academic ecosystem stats</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-num">450+</div>
              <div className="stat-text">Active Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">1,200+</div>
              <div className="stat-text">Queries Asked</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">3,500+</div>
              <div className="stat-text">Solutions Given</div>
            </div>
            <div className="stat-card">
              <div className="stat-num">98%</div>
              <div className="stat-text">Resolution Rate</div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
