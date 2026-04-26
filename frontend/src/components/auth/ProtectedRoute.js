import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard
    const dashboards = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      staff: '/staff/dashboard',
      patient: '/dashboard',
    };
    return <Navigate to={dashboards[user.role] || '/dashboard'} replace />;
  }

  return children;
};

const styles = {
  loading: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif", color: '#6c757d',
  },
  spinner: {
    width: '40px', height: '40px', border: '4px solid #e9ecef',
    borderTop: '4px solid #1b6ca8', borderRadius: '50%',
    animation: 'spin 1s linear infinite', marginBottom: '1rem',
  },
};

export default ProtectedRoute;
