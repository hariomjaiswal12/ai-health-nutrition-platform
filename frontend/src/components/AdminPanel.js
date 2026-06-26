// ==================== AdminPanel.js ====================
// Location: frontend/src/components/AdminPanel.js
// Purpose: Complete, modern admin user management panel

import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/apiClient';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

function AdminPanel() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);        // page loading
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [actionLoading, setActionLoading] = useState(''); // per‑row actions

  // Load users only when role is known
  useEffect(() => {
    // still waiting for auth
    if (!role) {
      return;
    }

    // non‑admin: send back to dashboard once role is known
    if (role !== 'admin') {
      navigate('/dashboard', { replace: true });
      return;
    }

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setMessage('');
    try {
      const data = await apiClient('http://localhost:5000/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading users:', err);
      setMessage('❌ Error loading users');
    }
    setLoading(false);
  };

  const handleDelete = async (userId, username) => {
    if (
      !window.confirm(
        `Are you sure you want to delete user "${username}"? This cannot be undone.`
      )
    ) {
      return;
    }
    setActionLoading(userId + '_delete');
    try {
      await apiClient(`http://localhost:5000/admin/users/${userId}`, {
        method: 'DELETE'
      });
      setMessage(`✅ User "${username}" deleted successfully`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setMessage('❌ Error deleting user');
    }
    setActionLoading('');
  };

  const handleToggleStatus = async (userId, username, currentStatus) => {
    const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user "${username}"?`)) {
      return;
    }
    setActionLoading(userId + '_status');
    try {
      await apiClient(
        `http://localhost:5000/admin/users/${userId}/toggle-status`,
        { method: 'PATCH' }
      );
      setMessage(`✅ User "${username}" ${action}d successfully`);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating user:', err);
      setMessage('❌ Error updating user');
    }
    setActionLoading('');
  };

  // Apply search and role filter
  const filtered = users.filter((user) => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const term = search.toLowerCase();
    const matchesSearch =
      user.username.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term);
    return matchesRole && matchesSearch;
  });

  // While auth role is still loading
  if (!role) {
    return (
      <div className="admin-users-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading user info...</p>
        </div>
      </div>
    );
  }

  // While users list is loading
  if (loading) {
    return (
      <div className="admin-users-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <div className="users-header">
        <h1>🔐 Admin Panel - User Management</h1>
        <p className="subtitle">
          Manage all users, view roles, filter, search, activate, deactivate, or delete
          users.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Search + Filters */}
      <div className="filter-section" style={{ marginBottom: 25 }}>
        <input
          className="search-input"
          style={{
            padding: '10px 18px',
            borderRadius: '7px',
            border: '2px solid #ddd',
            fontSize: '1rem',
            marginRight: '16px',
            minWidth: '260px'
          }}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search username or email..."
        />
        <div className="filter-buttons" style={{ display: 'inline-flex', gap: 10 }}>
          {['all', 'patient', 'doctor', 'admin'].map((roleOption) => (
            <button
              key={roleOption}
              className={`filter-btn ${filterRole === roleOption ? 'active' : ''}`}
              onClick={() => setFilterRole(roleOption)}
            >
              {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
              <span className="count">
                {
                  users.filter(
                    (u) => roleOption === 'all' || u.role === roleOption
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div
        className="card"
        style={{ marginTop: '10px', boxShadow: '0 4px 20px #e7e8ed22' }}
      >
        <h3>All Users ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <p className="no-users">No users found.</p>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user._id}
                    className={user.status === 'Inactive' ? 'inactive-row' : ''}
                  >
                    <td className="username-cell">
                      <strong>{user.username}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.status === 'Active'
                            ? 'status-active'
                            : 'status-inactive'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="lastlogin-cell">
                      {user.lastLogin === 'Never'
                        ? '❌ Never'
                        : user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleString()
                        : user.lastLogin || 'N/A'}
                    </td>
                    <td className="created-cell">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('en-IN')
                        : 'N/A'}
                    </td>
                    <td className="actions-cell">
                      <button
                        className={`btn-status ${
                          user.status === 'Active'
                            ? 'btn-deactivate'
                            : 'btn-activate'
                        }`}
                        onClick={() =>
                          handleToggleStatus(user._id, user.username, user.status)
                        }
                        title={
                          user.status === 'Active'
                            ? 'Deactivate user'
                            : 'Activate user'
                        }
                        disabled={actionLoading === user._id + '_status'}
                        style={{ marginRight: 0 }}
                      >
                        {user.status === 'Active' ? '🔒' : '🔓'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(user._id, user.username)}
                        title="Delete user"
                        disabled={actionLoading === user._id + '_delete'}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Statistics Cards */}
      <div className="stats-section" style={{ marginTop: 24 }}>
        <h3>📊 User Statistics</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Total Users</h4>
            <p className="stat-number">{users.length}</p>
          </div>
          <div className="stat-card">
            <h4>Patients</h4>
            <p className="stat-number">
              {users.filter((u) => u.role === 'patient').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Doctors</h4>
            <p className="stat-number">
              {users.filter((u) => u.role === 'doctor').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Admins</h4>
            <p className="stat-number">
              {users.filter((u) => u.role === 'admin').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Active Users</h4>
            <p className="stat-number">
              {users.filter((u) => u.status === 'Active').length}
            </p>
          </div>
          <div className="stat-card">
            <h4>Inactive Users</h4>
            <p className="stat-number">
              {users.filter((u) => u.status === 'Inactive').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
