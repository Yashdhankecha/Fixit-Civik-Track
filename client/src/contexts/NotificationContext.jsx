import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const fetchTimeoutRef = useRef(null);
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from AuthContext
  const [serverAvailable, setServerAvailable] = useState(null);

  // Check server health on mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    try {
      const health = await api.checkServerHealth();
      setServerAvailable(!!health);
    } catch (error) {
      setServerAvailable(false);
    }
  };

  const fetchUnreadCount = async () => {
    // Only fetch if user is authenticated and not still loading
    // Also only fetch if server is available
    if (authLoading || !user || serverAvailable === false) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't show error for rate limiting or network issues to avoid spam
      if (error.response?.status !== 429 && error.response?.status !== 404) {
        console.error('Failed to fetch unread count');
      }
      // Set default count when API is unavailable
      if (error.response?.status === 404 || !error.response) {
        setUnreadCount(0); // Default to 0 when service unavailable
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch unread count on mount only if user is authenticated
    if (!authLoading && user && serverAvailable !== false) {
      fetchUnreadCount();
      
      // Set up interval to refresh count every 60 seconds (increased to reduce API calls)
      const interval = setInterval(fetchUnreadCount, 60000);
      
      return () => {
        clearInterval(interval);
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
      };
    }
  }, [user, authLoading, serverAvailable]); // Re-run when user, authLoading, or serverAvailable changes

  const markAsRead = async (notificationId) => {
    // Only proceed if user is authenticated and server is available
    if (!user || serverAvailable === false) return;
    
    try {
      const response = await api.put(`/api/notifications/${notificationId}/read`);
      if (response.data.success) {
        // Decrease unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Only proceed if user is authenticated and server is available
    if (!user || serverAvailable === false) return;
    
    try {
      const response = await api.put('/api/notifications/read-all');
      if (response.data.success) {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    unreadCount,
    loading,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    serverAvailable,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};