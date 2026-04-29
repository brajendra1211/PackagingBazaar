import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAuthState } from '../utils/auth';

export const GuestRoute = () => {
  const { token, role } = getAuthState();
  
  // If user is already logged in, they shouldn't see Login/Register pages.
  if (token) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'seller') return <Navigate to="/seller/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

export const ProtectedRoute = () => {
  const { token } = getAuthState();
  
  // Base protection: Must be logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export const AdminRoute = () => {
  const { token, role } = getAuthState();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== 'admin') {
    return <Navigate to="/" replace />; // Unauthorized, send to home
  }
  
  return <Outlet />;
};

export const SellerRoute = () => {
  const { token, role } = getAuthState();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (role !== 'seller') {
    return <Navigate to="/" replace />; // Unauthorized, send to home
  }
  
  return <Outlet />;
};

/**
 * UserLayoutGuard:
 * Prevents logged-in Sellers and Admins from accessing the public UserLayout.
 * They should be confined to their respective dashboards.
 */
export const UserLayoutGuard = () => {
  const { token, role } = getAuthState();

  if (token) {
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'seller') return <Navigate to="/seller/dashboard" replace />;
  }

  return <Outlet />;
};

