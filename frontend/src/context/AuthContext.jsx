import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [initializing, setInitializing] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setInitializing(false);
      return;
    }

    try {
      const { data } = await api.get('/user/profile');
      const userData = data?.data?.userData;
      if (userData) {
        const safeUser = {
          _id: userData._id,
          email: userData.email,
          username: userData.username,
        };
        localStorage.setItem('user', JSON.stringify(safeUser));
        setUser(safeUser);
        setToken(savedToken);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setInitializing(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email, password) => {
    const { data } = await api.post('/user/login', { email, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    }
    return data;
  };

  const signup = async (payload) => {
    const { data } = await api.post('/user/signup', payload);
    return data;
  };

  const verifyOtp = async (otp, signupToken) => {
    const { data } = await api.post('/user/otp', { otp, signupToken });
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.get('/user/logout');
    } catch {
      // ignore network errors on logout
    }
    clearAuth();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      initializing,
      login,
      signup,
      verifyOtp,
      logout,
      refreshSession: restoreSession,
    }),
    [user, token, initializing, restoreSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
