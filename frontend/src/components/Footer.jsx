import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--secondary)',
      color: '#94a3b8',
      padding: '40px 16px 20px 16px',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
      flexShrink: 0
    }}>
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div>
          <h3 style={{ color: '#ffffff', fontFamily: 'var(--font-family-display)', marginBottom: '12px' }}>CampusQuery</h3>
          <p style={{ maxWidth: '320px', fontSize: '0.9rem', lineHeight: '1.5' }}>
            A college-specific Stack Overflow-style knowledge sharing base for campus students. Ask questions, post solutions, and earn reputation points.
          </p>
        </div>
        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '1rem' }}>Platform</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li><Link to="/questions" style={{ color: '#94a3b8' }}>All Questions</Link></li>
            <li><Link to="/ask" style={{ color: '#94a3b8' }}>Ask a Question</Link></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '1rem' }}>Support</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li><Link to="/" style={{ color: '#94a3b8' }}>Home</Link></li>
            <li style={{ color: '#64748b' }}>Campus Guideline Policies</li>
          </ul>
        </div>
      </div>
      <div style={{
        maxWidth: 'var(--max-width)',
        margin: '30px auto 0 auto',
        borderTop: '1px solid #334155',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '0.85rem'
      }}>
        &copy; {new Date().getFullYear()} CampusQuery. All rights reserved. Built with MERN Stack.
      </div>
    </footer>
  );
};

export default Footer;
