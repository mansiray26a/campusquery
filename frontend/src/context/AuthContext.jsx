import React, { createContext, useState, useEffect, useRef } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const authRevision = useRef(0);

  const checkUserLoggedIn = async () => {
    const revision = ++authRevision.current;
    const token = localStorage.getItem('token');
    if (!token) {
      if (revision === authRevision.current) {
        setUser(null);
        setLoading(false);
      }
      return;
    }

    try {
      const userData = await authService.getMe();
      if (revision === authRevision.current && localStorage.getItem('token') === token) {
        setUser(userData);
      }
    } catch (error) {
      if (revision === authRevision.current && localStorage.getItem('token') === token) {
        console.error('Failed to verify token:', error.message);
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      if (revision === authRevision.current) setLoading(false);
    }
  };

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== 'token') return;
      ++authRevision.current;
      setUser(null);
      if (event.newValue) {
        setLoading(true);
        checkUserLoggedIn();
      } else {
        setLoading(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginUser = async (email, password) => {
    const revision = ++authRevision.current;
    setLoading(true);
    try {
      const userData = await authService.login(email, password);
      if (revision === authRevision.current) {
        if (userData.token) localStorage.setItem('token', userData.token);
        setUser(userData);
      }
      return userData;
    } finally {
      if (revision === authRevision.current) setLoading(false);
    }
  };

  const registerUser = async (username, email, password) => {
    const revision = ++authRevision.current;
    setLoading(true);
    try {
      const userData = await authService.register(username, email, password);
      if (revision === authRevision.current) {
        if (userData.token) localStorage.setItem('token', userData.token);
        setUser(userData);
      }
      return userData;
    } finally {
      if (revision === authRevision.current) setLoading(false);
    }
  };

  const logoutUser = () => {
    ++authRevision.current;
    setUser(null);
    setLoading(false);
    return authService.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: loginUser,
        register: registerUser,
        logout: logoutUser,
        checkUserLoggedIn,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
