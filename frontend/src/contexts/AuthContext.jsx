import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('okave_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('okave_token', data.token);
      localStorage.setItem('okave_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register(payload);
      localStorage.setItem('okave_token', data.token);
      localStorage.setItem('okave_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('okave_token');
    localStorage.removeItem('okave_user');
    setUser(null);
  };

  const isAgent = user?.role === 'AGENT';
  const isBuyer = user?.role === 'BUYER';
  const isAdmin = user?.role === 'ADMIN';
  const isCoopAdmin = user?.role === 'COOP_ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAgent, isBuyer, isAdmin, isCoopAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
