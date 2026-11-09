import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

const AuthContext = createContext(null);
const USER_STORAGE_KEY = 'autolearn_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Synchronize session on mount with MongoDB backend
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const res = await apiFetch('/api/auth/me');
        if (isMounted && res && res.ok && res.user) {
          setUser(res.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        }
      } catch (err) {
        // Not logged in or session expired
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const signup = async ({ name, email, password, goal }) => {
    setAuthError(null);
    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, goal })
      });
      if (res && res.ok && res.user) {
        setUser(res.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true, user: res.user, message: res.message };
      }
      throw new Error(res?.error || 'Registration failed.');
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your inputs.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const login = async ({ email, password }) => {
    setAuthError(null);
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res && res.ok && res.user) {
        setUser(res.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
        return { success: true, user: res.user, message: res.message };
      }
      throw new Error(res?.error || 'Login failed.');
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore network errors on logout
    }
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        authError,
        setAuthError,
        signup,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
