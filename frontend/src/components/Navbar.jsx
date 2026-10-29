import React, { useContext, useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} aria-label="Main navigation">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" aria-label="CampusQuery home">
          Campus<span>Query</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links" role="menubar">
          <NavLink
            to="/questions"
            className={({ isActive }) => `navbar-item${isActive ? ' active' : ''}`}
            role="menuitem"
          >
            Questions
          </NavLink>
          {user && (
            <>
              <NavLink
                to="/ask"
                className={({ isActive }) => `navbar-item${isActive ? ' active' : ''}`}
                role="menuitem"
              >
                Ask
              </NavLink>
              <NavLink
                to="/my-questions"
                className={({ isActive }) => `navbar-item${isActive ? ' active' : ''}`}
                role="menuitem"
              >
                My Questions
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `navbar-item navbar-item--admin${isActive ? ' active' : ''}`}
              role="menuitem"
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Desktop User Actions */}
        <div className="navbar-user">
          {user ? (
            <>
              <span className="navbar-rep" title="Reputation Points" aria-label={`${user.reputation || 0} reputation points`}>
                &#9733; {user.reputation || 0}
              </span>
              <Link to="/profile" className="navbar-avatar" title={`View profile: ${user.username}`} aria-label="View your profile">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} />
                ) : (
                  <span aria-hidden="true">{user.username.charAt(0).toUpperCase()}</span>
                )}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join now
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className={`navbar-hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu"
        className={`navbar-mobile${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="navbar-mobile-links">
          <NavLink to="/questions" className={({ isActive }) => `navbar-mobile-item${isActive ? ' active' : ''}`}>
            Questions
          </NavLink>
          {user && (
            <>
              <NavLink to="/ask" className={({ isActive }) => `navbar-mobile-item${isActive ? ' active' : ''}`}>
                Ask a Question
              </NavLink>
              <NavLink to="/my-questions" className={({ isActive }) => `navbar-mobile-item${isActive ? ' active' : ''}`}>
                My Questions
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `navbar-mobile-item${isActive ? ' active' : ''}`}>
                Dashboard
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `navbar-mobile-item${isActive ? ' active' : ''}`}>
                Profile
              </NavLink>
            </>
          )}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `navbar-mobile-item navbar-mobile-item--admin${isActive ? ' active' : ''}`}>
              Admin Panel
            </NavLink>
          )}
        </div>

        <div className="navbar-mobile-footer">
          {user ? (
            <>
              <div className="navbar-mobile-user">
                <div className="navbar-mobile-avatar" aria-hidden="true">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.username} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="navbar-mobile-username">{user.username}</div>
                  <div className="navbar-mobile-rep">&#9733; {user.reputation || 0} rep</div>
                </div>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>
                Sign out
              </button>
            </>
          ) : (
            <div className="navbar-mobile-auth">
              <Link to="/login" className="btn btn-secondary">Sign in</Link>
              <Link to="/register" className="btn btn-primary">Join now</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div className="navbar-backdrop" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}
    </nav>
  );
};

export default Navbar;
