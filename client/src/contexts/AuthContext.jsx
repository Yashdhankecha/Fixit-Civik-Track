import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const authCheckTimeoutRef = useRef(null);

  // Check if user is logged in on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAdmin(userData.role === 'admin');
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Optionally verify token with server (but don't block loading)
          checkAuthStatus().catch(console.error);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initializeAuth();
    
    // Cleanup timeout on unmount
    return () => {
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    // Clear any existing timeout
    if (authCheckTimeoutRef.current) {
      clearTimeout(authCheckTimeoutRef.current);
    }

    // Debounce auth checks to prevent multiple rapid requests
    authCheckTimeoutRef.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUser(null);
          setIsAdmin(false);
          return;
        }

        // Check with server
        const response = await api.get('/api/auth/me');
        if (response.data.success) {
          const userData = response.data.data.user;
          setUser(userData);
          setIsAdmin(userData.role === 'admin');
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only clear auth if it's a 401 error, not network errors
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setUser(null);
          setIsAdmin(false);
        }
      }
    }, 100); // 100ms debounce
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await api.post('/api/auth/login', {
        email,
        password
      });

      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        
        toast.success('Welcome back to FixIt!');
        // Use window.location.href to avoid React Router conflicts
        window.location.href = '/';
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      const response = await api.post('/api/auth/register', {
        name: userData.fullName,
        email: userData.email,
        password: userData.password
      });

      if (response.data.success) {
        const { token, user: newUser } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(newUser);
        setIsAdmin(newUser.role === 'admin');
        
        toast.success('FixIt account created successfully!');
        // Use window.location.href to avoid React Router conflicts
        window.location.href = '/onboarding';
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      
      const response = await api.post('/api/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password
      });

      if (response.data.success) {
        toast.success('Account created successfully! Please verify your email.');
        return { success: true, message: 'Account created successfully! Please verify your email.' };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      setLoading(true);
      
      // For now, just simulate email verification
      // In a real app, you would verify the OTP with the server
      if (otp === '123456') { // Mock OTP for development
        toast.success('Email verified successfully!');
        return { success: true, message: 'Email verified successfully!' };
      } else {
        return { success: false, error: 'Invalid verification code' };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Email verification failed';
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAdmin(false);
      toast.success('Logged out successfully');
      // Use window.location.href to avoid React Router conflicts
      window.location.href = '/login';
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/api/auth/profile', updates);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await api.put('/api/auth/preferences', preferences);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Preferences updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update preferences';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to send reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const resetPassword = async (email, newPassword) => {
    try {
      const response = await api.post('/api/auth/reset-password', {
        email,
        newPassword
      });
      
      if (response.data.success) {
        toast.success('Password updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to reset password';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAdmin,
    login,
    register,
    signUp,
    verifyEmail,
    logout,
    updateUser,
    updateProfile,
    updatePreferences,
    forgotPassword,
    resetPassword,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 