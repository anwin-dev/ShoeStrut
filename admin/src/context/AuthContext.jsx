import { createContext, useContext, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('adminToken'));
  const [adminId, setAdminId] = useState(() => localStorage.getItem('adminId'));

  const login = async (email, password) => {
    const { data } = await api.post('/admin/login', { email, password });
    if (data.token) {
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
    }
    if (data.adminId) {
      localStorage.setItem('adminId', data.adminId);
      setAdminId(data.adminId);
    }
    return data;
  };

  const logout = async () => {
    try {
      await api.get('/admin/logout');
    } catch {
      // ignore
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    setToken(null);
    setAdminId(null);
  };

  const value = useMemo(
    () => ({
      token,
      adminId,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, adminId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
