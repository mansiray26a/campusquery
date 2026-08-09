import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', color: 'var(--primary)', marginBottom: '10px', fontFamily: 'var(--font-family-display)' }}>404</h1>
        <h2 style={{ marginBottom: '20px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '30px', fontSize: '1rem' }}>
          The page you are looking for does not exist or has been moved. Check the URL or return home.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
