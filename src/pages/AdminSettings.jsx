import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import '../styles/AdminSettings.css';

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Get current admin info
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setAdminInfo(user);
      setNewUsername(user.username);
    }
  }, []);

  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Validation
    if (!currentPassword) {
      setError('Please enter your current password');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // First verify current password
      const loginData = await api.post('/api/auth/login', {
        username: adminInfo.username,
        password: currentPassword
      });

      if (!loginData) {
        throw new Error('Current password is incorrect');
      }

      // If password verification passed, make change
      const data = await api.post('/api/admin/update-credentials', {
        currentPassword,
        newUsername: newUsername !== adminInfo.username ? newUsername : null,
        newPassword: newPassword || null
      });
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify({
        ...adminInfo,
        username: newUsername
      }));

      setMessage('✅ Credentials updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setAdminInfo({
        ...adminInfo,
        username: newUsername
      });

    } catch (err) {
      setError(err.message || 'Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-settings-container">
      <div className="settings-card">
        <h2>🔐 Admin Settings</h2>
        <p className="subtitle">Change your username and password</p>

        {adminInfo && (
          <form onSubmit={handleChangeCredentials} className="settings-form">
            
            {/* Current Info */}
            <div className="info-section">
              <h3>Current Account</h3>
              <div className="info-display">
                <p><strong>Username:</strong> {adminInfo.username}</p>
                <p><strong>Role:</strong> {adminInfo.role}</p>
              </div>
            </div>

            {/* Verification */}
            <div className="form-group">
              <label htmlFor="current-password">Current Password *</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                className="form-input"
              />
              <small>Required to verify your identity</small>
            </div>

            {/* New Username */}
            <div className="form-group">
              <label htmlFor="new-username">New Username (optional)</label>
              <input
                id="new-username"
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Leave blank to keep current username"
                className="form-input"
                minLength="3"
                pattern="[a-zA-Z0-9_-]+"
              />
              <small>3+ characters, letters/numbers/underscore only</small>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label htmlFor="new-password">New Password (optional)</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="form-input"
                minLength="6"
              />
              <small>6+ characters. Leave blank to keep current password</small>
            </div>

            {/* Confirm Password */}
            {newPassword && (
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password *</label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="form-input"
                  required
                />
              </div>
            )}

            {/* Messages */}
            {error && (
              <div className="alert alert-error">
                ❌ {error}
              </div>
            )}
            {message && (
              <div className="alert alert-success">
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary btn-block"
            >
              {loading ? 'Updating...' : '💾 Update Credentials'}
            </button>

            <div className="warning-note">
              ⚠️ <strong>Note:</strong> You will need to login again after changing your credentials.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
