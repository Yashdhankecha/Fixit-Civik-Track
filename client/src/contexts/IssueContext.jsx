import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from './LocationContext';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const IssueContext = createContext();

export const useIssue = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssue must be used within an IssueProvider');
  }
  return context;
};

// Mock data for development
const mockIssues = [
  {
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues and potential damage to vehicles.',
    category: 'roads',
    status: 'reported',
    severity: 'high',
    location: { lat: 40.7128, lng: -74.0060 },
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    reporter: { name: 'John Doe', email: 'john@example.com' },
    images: [],
    flags: [],
    followers: 5
  },
  {
    id: '2',
    title: 'Broken Street Light',
    description: 'Street light not working for the past 3 days, making the area unsafe at night.',
    category: 'lighting',
    status: 'in_progress',
    severity: 'medium',
    location: { lat: 40.7130, lng: -74.0055 },
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-16T09:20:00Z'),
    reporter: { name: 'Jane Smith', email: 'jane@example.com' },
    images: [],
    flags: [],
    followers: 3
  },
  {
    id: '3',
    title: 'Water Leak on 5th Avenue',
    description: 'Water leaking from underground pipe, creating a small pond on the sidewalk.',
    category: 'water',
    status: 'resolved',
    severity: 'high',
    location: { lat: 40.7125, lng: -74.0065 },
    createdAt: new Date('2024-01-10T08:15:00Z'),
    updatedAt: new Date('2024-01-12T14:30:00Z'),
    reporter: { name: 'Mike Johnson', email: 'mike@example.com' },
    images: [],
    flags: [],
    followers: 8
  },
  {
    id: '4',
    title: 'Garbage Not Collected',
    description: 'Garbage bins overflowing, attracting pests and creating unpleasant odors.',
    category: 'cleanliness',
    status: 'reported',
    severity: 'medium',
    location: { lat: 40.7135, lng: -74.0050 },
    createdAt: new Date('2024-01-17T12:00:00Z'),
    updatedAt: new Date('2024-01-17T12:00:00Z'),
    reporter: { name: 'Sarah Wilson', email: 'sarah@example.com' },
    images: [],
    flags: [],
    followers: 2
  },
  {
    id: '5',
    title: 'Suspicious Activity in Park',
    description: 'Suspicious individuals loitering in the park after hours, making residents feel unsafe.',
    category: 'safety',
    status: 'in_progress',
    severity: 'high',
    location: { lat: 40.7120, lng: -74.0070 },
    createdAt: new Date('2024-01-16T20:30:00Z'),
    updatedAt: new Date('2024-01-17T11:15:00Z'),
    reporter: { name: 'Anonymous', email: null },
    images: [],
    flags: [],
    followers: 12
  }
];

export const IssueProvider = ({ children }) => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    radius: 3,
  });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const { selectedLocation, isWithinRadius } = useLocation();
  const { user, token } = useAuth();
  const fetchTimeoutRef = useRef(null);

  // Initialize with mock data for development
  useEffect(() => {
    setIssues(mockIssues);
  }, []);

  // Fetch issues when location changes with debouncing
  useEffect(() => {
    if (selectedLocation) {
      // Clear any existing timeout
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      // Set a new timeout to debounce the request
      fetchTimeoutRef.current = setTimeout(() => {
        fetchIssues();
      }, 500); // 500ms delay
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedLocation, filters.status, filters.category, filters.radius]);

  // Filter issues based on current filters and location
  useEffect(() => {
    if (issues.length > 0 && selectedLocation) {
      const filtered = issues.filter(issue => {
        // Check if issue is within radius
        const withinRadius = isWithinRadius ? isWithinRadius(issue.location) : true;
        
        // Apply status filter
        const statusMatch = filters.status === 'all' || issue.status === filters.status;
        
        // Apply category filter
        const categoryMatch = filters.category === 'all' || issue.category === filters.category;
        
        return withinRadius && statusMatch && categoryMatch;
      });
      
      setFilteredIssues(filtered);
    } else {
      setFilteredIssues(issues);
    }
  }, [issues, filters, selectedLocation]);

  const fetchIssues = async (retryCount = 0) => {
    if (!selectedLocation) return;
    
    setLoading(true);
    try {
      const response = await api.get('/api/issues', {
        params: {
          location: `${selectedLocation.lat},${selectedLocation.lng}`,
          radius: filters.radius,
          status: filters.status,
          category: filters.category
        }
      });
      
      if (response.data.success) {
        setIssues(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch issues');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      
      // Handle rate limiting with retry
      if (error.response?.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited, retrying in ${delay}ms...`);
        
        setTimeout(() => {
          fetchIssues(retryCount + 1);
        }, delay);
        return;
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error('Failed to load issues');
      }
      
      // Fallback to mock data
      setIssues(mockIssues);
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (issueData) => {
    try {
      const response = await api.post('/api/issues', issueData);
      
      if (response.data.success) {
        setIssues(prev => [response.data.data, ...prev]);
        toast.success('Issue reported successfully!');
        return { success: true, issue: response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to create issue');
      }
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to report issue');
      return { success: false, error: error.message };
    }
  };

  const updateIssue = async (issueId, updates) => {
    try {
      const response = await api.put(`/api/issues/${issueId}`, updates);
      
      if (response.data.success) {
        setIssues(prev => prev.map(issue => 
          issue._id === issueId 
            ? response.data.data
            : issue
        ));
        toast.success('Issue updated successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to update issue');
      }
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue');
      return { success: false, error: error.message };
    }
  };

  const deleteIssue = async (issueId) => {
    try {
      const response = await api.delete(`/api/issues/${issueId}`);
      
      if (response.data.success) {
        setIssues(prev => prev.filter(issue => issue._id !== issueId));
        toast.success('Issue deleted successfully!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to delete issue');
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
      return { success: false, error: error.message };
    }
  };

  const flagIssue = async (issueId, reason) => {
    try {
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { 
              ...issue, 
              flags: [...(issue.flags || []), { reason, createdAt: new Date() }]
            }
          : issue
      ));
      
      toast.success('Issue flagged successfully!');
      return { success: true };
    } catch (error) {
      console.error('Error flagging issue:', error);
      toast.error('Failed to flag issue');
      return { success: false, error: error.message };
    }
  };

  const followIssue = async (issueId) => {
    try {
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, followers: (issue.followers || 0) + 1 }
          : issue
      ));
      
      toast.success('Now following this issue!');
      return { success: true };
    } catch (error) {
      console.error('Error following issue:', error);
      toast.error('Failed to follow issue');
      return { success: false, error: error.message };
    }
  };

  const unfollowIssue = async (issueId) => {
    try {
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, followers: Math.max(0, (issue.followers || 0) - 1) }
          : issue
      ));
      
      toast.success('Unfollowed this issue');
      return { success: true };
    } catch (error) {
      console.error('Error unfollowing issue:', error);
      toast.error('Failed to unfollow issue');
      return { success: false, error: error.message };
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const getIssueById = (issueId) => {
    return issues.find(issue => issue.id === issueId);
  };

  const getIssuesByCategory = (category) => {
    return issues.filter(issue => issue.category === category);
  };

  const getIssuesByStatus = (status) => {
    return issues.filter(issue => issue.status === status);
  };

  const getIssueStats = () => {
    const total = issues.length;
    const reported = issues.filter(issue => issue.status === 'reported').length;
    const inProgress = issues.filter(issue => issue.status === 'in_progress').length;
    const resolved = issues.filter(issue => issue.status === 'resolved').length;
    
    return { total, reported, inProgress, resolved };
  };

  const getUserIssues = useCallback(async (options = {}) => {
    try {
      const response = await api.get('/api/issues/my-issues', {
        params: options
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user issues');
      }
    } catch (error) {
      console.error('Error fetching user issues:', error);
      toast.error('Failed to load your issues');
      return [];
    }
  }, []);

  const getUserStats = async () => {
    try {
      const response = await api.get('/api/issues/my-stats');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user stats');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        total: 0,
        reported: 0,
        inProgress: 0,
        resolved: 0,
        totalVotes: 0,
        totalComments: 0
      };
    }
  };

  const value = {
    issues,
    filteredIssues,
    loading,
    filters,
    selectedIssue,
    setSelectedIssue,
    fetchIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    flagIssue,
    followIssue,
    unfollowIssue,
    updateFilters,
    getIssueById,
    getIssuesByCategory,
    getIssuesByStatus,
    getIssueStats,
    getUserIssues,
    getUserStats,
  };

  return (
    <IssueContext.Provider value={value}>
      {children}
    </IssueContext.Provider>
  );
}; 