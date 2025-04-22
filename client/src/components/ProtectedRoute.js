import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const assessmentId = localStorage.getItem('assessmentId');
  const userId = localStorage.getItem('userId');

  console.log('ProtectedRoute - Auth State:', { 
    isAuthenticated,
    userId,
    assessmentId,
    path: location.pathname,
    state: location.state
  });

  // For most protected routes, require user authentication
  // Exceptions:
  // 1. Allow dashboard access if assessmentId exists (even without authentication)
  // 2. Always allow access to user-dashboard (authentication will be checked there)
  const isDashboardWithAssessment = location.pathname === '/dashboard' && assessmentId;
  const isUserDashboard = location.pathname === '/user-dashboard';
  
  if (!isAuthenticated && !userId && !isDashboardWithAssessment && !isUserDashboard) {
    console.log('Not authenticated, redirecting to login');
    // Only clear assessment data if not a dashboard access with assessmentId
    if (!isDashboardWithAssessment) {
      localStorage.removeItem('assessmentId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If we have the required data, render the protected content
  console.log('Authentication or assessment data found, rendering protected content');
  return children;
};

export default ProtectedRoute; 