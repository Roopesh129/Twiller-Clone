import React from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SessionManagement = () => {
  const { user } = useAuth();

  const handleLogoutAllSessions = async () => {
    if (!user) {
      alert('User not authenticated');
      return;
    }
    if (window.confirm('Are you sure you want to log out from all sessions?')) {
      try {
        await axios.post('/api/auth/logout-all-sessions', { email: user.email });
        alert('All sessions logged out successfully');
      } catch (error) {
        alert('Failed to logout all sessions');
      }
    }
  };

  return (
    <div className="session-management">
      <h2>Active Sessions</h2>
      <button onClick={handleLogoutAllSessions} className="btn-danger">
        Logout All Sessions
      </button>
    </div>
  );
};

export default SessionManagement;