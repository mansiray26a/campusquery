import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Campus<span>Query</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/questions" className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}>
            All Questions
          </NavLink>
          {user && (
            <>
              <NavLink to="/ask" className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}>
                Ask Question
              </NavLink>
              <NavLink to="/my-questions" className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}>
                My Questions
              </NavLink>
            </>
          )}
          {user && user.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `navbar-item ${isActive ? 'active' : ''}`}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="navbar-user">
          {user ? (
            <>
              <span className="navbar-rep" title="Reputation Points">🏆 {user.reputation || 0}</span>
              <span className="navbar-username">
                <Link to="/profile">{user.username}</Link>
              </span>
              <Link to="/profile" className="navbar-avatar" title="View Profile">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
