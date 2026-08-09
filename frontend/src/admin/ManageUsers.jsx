import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as adminService from '../services/adminService';
import '../styles/adminDashboard.css';
import '../styles/manageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch user list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setError('');
    setSuccess('');
    try {
      await adminService.updateUserRole(userId, newRole);
      setSuccess('User role updated successfully.');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete ${username}? This will remove all their contributions, questions, and answers permanently.`)) {
      setError('');
      setSuccess('');
      try {
        await adminService.deleteUser(userId);
        setSuccess(`User ${username} deleted successfully.`);
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || 'Failed to delete user.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-spinner">Loading users registry...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <h2>Admin Portal</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="admin-grid">
          <div className="admin-sidebar">
            <Link to="/admin" className="admin-nav-item">📊 Stats Overview</Link>
            <Link to="/admin/users" className="admin-nav-item active">👥 Manage Users</Link>
            <Link to="/admin/questions" className="admin-nav-item">❓ Manage Questions</Link>
            <Link to="/admin/answers" className="admin-nav-item">💬 Manage Answers</Link>
            <Link to="/admin/tags" className="admin-nav-item">🏷️ Manage Tags</Link>
            <Link to="/admin/reports" className="admin-nav-item">🚨 Reports Review</Link>
          </div>

          <div className="admin-main">
            <h3>Manage Users</h3>
            <div className="user-moderation-card table-responsive">
              <table className="table-custom">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Reputation</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <strong>{u.username}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>🏆 {u.reputation}</td>
                      <td>
                        <select
                          className="user-role-select"
                          value={u.role}
                          disabled={u.email === 'admin@campusquery.com'} // secure built-in admin if any
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        >
                          <option value="student">student</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="user-action-cell">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.username)}
                            className="btn btn-danger btn-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageUsers;
