import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, googleLoginUser, fetchCurrentUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('payvault_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('payvault_token');
    localStorage.removeItem('payvault_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetchCurrentUser();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch {
      // The interceptor handles expired sessions; keep the current UI stable for transient failures.
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('payvault_token');
      if (savedToken) {
        try {
          const res = await fetchCurrentUser();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session check failed:', err.response?.data?.message || err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('payvault_token', res.token);
      localStorage.setItem('payvault_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (username, email, password) => {
    const res = await registerUser({ username, email, password });
    if (res.success && res.token) {
      localStorage.setItem('payvault_token', res.token);
      localStorage.setItem('payvault_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const loginWithGoogle = async (googleData) => {
    const res = await googleLoginUser(googleData);
    if (res.success && res.token) {
      localStorage.setItem('payvault_token', res.token);
      localStorage.setItem('payvault_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Google login failed');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
