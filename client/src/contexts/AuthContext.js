import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // ✅ Check if user is logged in on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/verify');

          if (response.status === 200 && response.data) {
            setUser(response.data);
            // Store userId in localStorage for easier access in API calls
            if (response.data.id) {
              localStorage.setItem('userId', response.data.id);
            }
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            delete api.defaults.headers.common['Authorization'];
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [token]);

  const login = async (newToken) => {
    if (!newToken) {
      console.error('No token provided to login');
      return false;
    }

    try {
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);

      const response = await api.get('/auth/verify');
      if (response.status === 200 && response.data) {
        setUser(response.data);
        return true;
      } else {
        throw new Error('Invalid token or user data');
      }
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['x-auth-token'];
    delete api.defaults.headers.common['x-user-id'];
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
