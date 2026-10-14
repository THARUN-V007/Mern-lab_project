import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, loginCustomer, logoutCustomer } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if session exists on initial load
  const checkAuth = useCallback(async () => {
    try {
      const data = await getProfile();
      setUser(data);
      setAuthError(null);
      return data;
    } catch (err) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const res = await loginCustomer(credentials);
      // After cookie is set by server, fetch profile
      const profile = await getProfile();
      setUser(profile);
      return { success: true, data: res };
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      throw new Error(message);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await logoutCustomer();
    } catch (err) {
      console.warn('Logout server notification failed:', err);
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated: Boolean(user),
    authError,
    setAuthError,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
