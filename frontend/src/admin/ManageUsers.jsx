import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminSidebar from './AdminSidebar';
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
    if (window.confirm(`Are you sure you want to delete ${username}? This will permanently remove all their contributions, questions, and answers.`)) {
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            color: 'var(--bronze)',
            marginBottom: 'var(--space-1)'
          }}>
            Governance
          </div>
          <h2>Manage Users</h2>
        </div>

        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <div className="admin-grid">
          <AdminSidebar />

          <section className="admin-main" aria-label="User directory">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Registered Users ({users.length})</h3>
            </div>

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
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        <span className="navbar-rep" style={{ fontSize: '0.75rem', padding: '1px 6px' }}>
                          &#9733; {u.reputation || 0}
                        </span>
                      </td>
                      <td>
                        <select
                          className="user-role-select"
                          value={u.role}
                          disabled={u.email === 'admin@campusquery.com'}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          aria-label={`Change role for ${u.username}`}
                        >
                          <option value="student">student</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatDate(u.createdAt)}</td>
                      <td>
                        <div className="user-action-cell">
                          <button
                            onClick={() => handleDeleteUser(u._id, u.username)}
                            className="btn btn-danger btn-sm"
                            aria-label={`Delete ${u.username}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-secondary)' }}>
                        No users registered in system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageUsers;
