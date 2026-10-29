import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/footer.css';

const Footer = () => {
  const { pathname } = useLocation();
  const year = new Date().getFullYear();

  if (pathname !== '/') return null;

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">Campus<span>Query</span></Link>
          <p className="footer-tagline">
            A campus-built knowledge platform where students ask questions,
            share answers, and earn recognition.
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer navigation">
          <div className="footer-nav-group">
            <h4>Platform</h4>
            <ul>
              <li><Link to="/questions">Browse Questions</Link></li>
              <li><Link to="/ask">Ask a Question</Link></li>
              <li><Link to="/dashboard">My Dashboard</Link></li>
            </ul>
          </div>
          <div className="footer-nav-group">
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Sign In</Link></li>
              <li><Link to="/register">Create Account</Link></li>
              <li><Link to="/profile">Profile</Link></li>
            </ul>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} CampusQuery. Open-source campus Q&amp;A platform.</p>
        <p className="footer-tech">Built with React, Node.js &amp; Groq AI</p>
      </div>
    </footer>
  );
};

export default Footer;
