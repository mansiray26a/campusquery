import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-4)'
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(5rem, 12vw, 8rem)',
          fontWeight: 700,
          color: 'var(--bronze)',
          lineHeight: 1,
          marginBottom: 'var(--space-2)'
        }}>
          404
        </span>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
          marginBottom: 'var(--space-3)',
          color: 'var(--ink-800)'
        }}>
          Page Not Found
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          maxWidth: '440px',
          marginBottom: 'var(--space-6)',
          fontSize: '1rem',
          lineHeight: 1.6
        }}>
          The page or query you were looking for doesn't exist, has been removed, or is temporarily unavailable.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
          <Link to="/questions" className="btn btn-secondary">
            Browse All Questions
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
