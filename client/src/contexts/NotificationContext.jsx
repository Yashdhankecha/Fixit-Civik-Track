import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../utils/api';

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

  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      // Don't show error for rate limiting to avoid spam
      if (error.response?.status !== 429) {
        console.error('Failed to fetch unread count');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch unread count on mount
    fetchUnreadCount();
    
    // Set up interval to refresh count every 60 seconds (increased to reduce API calls)
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => {
      clearInterval(interval);
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const markAsRead = async (notificationId) => {
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
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 