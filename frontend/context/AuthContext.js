'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = Cookies.get('wx_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch {
      Cookies.remove('wx_token');
      localStorage.removeItem('wx_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    Cookies.set('wx_token', data.token, { expires: 7 });
    localStorage.setItem('wx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    Cookies.set('wx_token', data.token, { expires: 7 });
    localStorage.setItem('wx_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    Cookies.remove('wx_token');
    localStorage.removeItem('wx_user');
    localStorage.removeItem('wx_cart');
    setUser(null);
    toast.success('Signed out successfully');
  };

  const updateUser = (updatedUser) => setUser(updatedUser);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
