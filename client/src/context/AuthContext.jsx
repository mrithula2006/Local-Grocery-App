import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        const { token: receivedToken, ...userData } = res.data;
        setToken(receivedToken);
        setUser(userData);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const res = await authApi.register(userData);
      if (res.success && res.data) {
        const { token: receivedToken, ...registeredUser } = res.data;
        setToken(receivedToken);
        setUser(registeredUser);
        localStorage.setItem('token', receivedToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        return { success: true, user: registeredUser };
      }
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  const quickLogin = async (role) => {
    let email = 'customer@freshcart.com';
    if (role === 'admin') email = 'admin@freshcart.com';
    if (role === 'delivery') email = 'delivery@freshcart.com';
    return await login(email, 'password123');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authError,
        setAuthError,
        login,
        register,
        logout,
        quickLogin,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDelivery: user?.role === 'delivery',
        isCustomer: user?.role === 'customer',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
