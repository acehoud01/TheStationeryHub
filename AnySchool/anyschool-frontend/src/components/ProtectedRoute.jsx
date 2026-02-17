import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

/**
 * Protected Route Component
 * 
 * Handles authentication check with proper loading state.
 * Prevents redirect flash during auth restoration.
 * 
 * FIXES ISSUE #2: Immediate redirect before auth is restored
 * 
 * Usage:
 * <Route path="/children" element={
 *   <ProtectedRoute requireRole="PARENT">
 *     <ChildrenManagementPage />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({ children, requireRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Wait for auth to load before making decisions
  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Optional role check - supports single role or array of roles
  if (requireRole) {
    const allowedRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
