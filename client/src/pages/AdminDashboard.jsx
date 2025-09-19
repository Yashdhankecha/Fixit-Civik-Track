import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  MapPin,
  Eye,
  RefreshCw,
  Search,
  BarChart3,
  Zap,
  UserCheck,
  UserX,
  Download,
  Trash2,
  Bell,
  User,
  Lock,
  Unlock,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({ title: '', message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse] = await Promise.all([
        api.get('/api/admin/stats')
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch issues with pagination and filters
  const fetchIssues = useCallback(async () => {
    try {
      console.log('Fetching issues...'); // Debug log
      setLoading(true); // Set loading to true when starting to fetch issues
      
      // Build params object with only non-empty values
      const params = {};
      if (currentPage) params.page = currentPage;
      if (20) params.limit = 20;
      if (filter && filter !== 'all') params.status = filter;
      if (searchTerm && searchTerm.trim() !== '') params.search = searchTerm;
      if (sortBy) params.sortBy = sortBy;

      // Convert to query string
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/admin/issues${queryString ? `?${queryString}` : ''}`;

      console.log('API call url:', url); // Debug log
      const response = await api.get(url);
      
      console.log('API response:', response.data); // Debug log
      
      if (response.data.success) {
        setIssues(response.data.data.issues);
        setTotalPages(response.data.data.pagination.pages);
        console.log('Issues loaded successfully:', response.data.data.issues.length); // Debug log
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false); // Always set loading to false when done
    }
  }, [currentPage, filter, searchTerm, sortBy]);

  // Fetch users with pagination and filters
  const fetchUsers = useCallback(async () => {
    try {
      console.log('Fetching users...'); // Debug log
      setLoading(true); // Set loading to true when starting to fetch users
      
      // Build params object with only non-empty values
      const params = {};
      if (userCurrentPage) params.page = userCurrentPage;
      if (20) params.limit = 20;
      if (userFilter && userFilter !== 'all') params.role = userFilter;
      if (userSearch && userSearch.trim() !== '') params.search = userSearch;

      // Convert to query string
      const queryString = new URLSearchParams(params).toString();
      const url = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

      console.log('API call url:', url); // Debug log
      const response = await api.get(url);
      
      console.log('API response:', response.data); // Debug log
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setUserTotalPages(response.data.data.pagination.pages);
        console.log('Users loaded successfully:', response.data.data.users.length); // Debug log
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false); // Always set loading to false when done
    }
  }, [userCurrentPage, userFilter, userSearch]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'issues') {
      fetchIssues();
    }
  }, [activeTab, currentPage, filter, searchTerm, sortBy, fetchIssues]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, userCurrentPage, userFilter, userSearch, fetchUsers]);

  // Update issue status
  const updateIssueStatus = async (issueId, newStatus, adminNote = '') => {
    try {
      setUpdatingStatus(issueId);
      const response = await api.patch(`/api/admin/issues/${issueId}/status`, {
        status: newStatus,
        adminNote
      });

      if (response.data.success) {
        setIssues(prevIssues => 
          prevIssues.map(issue => 
            issue._id === issueId 
              ? { ...issue, status: newStatus, statusLogs: response.data.data.statusLogs }
              : issue
          )
        );
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Delete issue
  const deleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;

    try {
      const response = await api.delete(`/api/admin/issues/${issueId}`);
      
      if (response.data.success) {
        setIssues(prevIssues => prevIssues.filter(issue => issue._id !== issueId));
        toast.success('Issue deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
    }
  };

  // Update user status
  const updateUserStatus = async (userId, updates) => {
    try {
      const response = await api.patch(`/api/admin/users/${userId}`, updates);
      
      if (response.data.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId 
              ? { ...user, ...updates }
              : user
          )
        );
        toast.success('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also delete all their issues.')) return;

    try {
      const response = await api.delete(`/api/admin/users/${userId}`);
      
      if (response.data.success) {
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Send notification to all users
  const sendNotification = async () => {
    try {
      const response = await api.post('/api/admin/notifications', notificationData);
      
      if (response.data.success) {
        toast.success(response.data.message);
        setShowNotificationModal(false);
        setNotificationData({ title: '', message: '' });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  // Export data
  const exportData = async (type) => {
    try {
      const response = await api.get(`/api/admin/export?type=${type}`);
      
      if (response.data.success) {
        // Create and download file
        const dataStr = JSON.stringify(response.data.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`${type} data exported successfully`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case 'reported':
        return { color: 'from-red-500 to-pink-500', icon: AlertCircle, bg: 'from-red-50 to-pink-50' };
      case 'in_progress':
        return { color: 'from-yellow-500 to-orange-500', icon: Clock, bg: 'from-yellow-50 to-orange-50' };
      case 'resolved':
        return { color: 'from-green-500 to-emerald-500', icon: CheckCircle, bg: 'from-green-50 to-emerald-50' };
      case 'closed':
        return { color: 'from-gray-500 to-gray-600', icon: XCircle, bg: 'from-gray-50 to-gray-100' };
      default:
        return { color: 'from-blue-500 to-indigo-500', icon: Shield, bg: 'from-blue-50 to-indigo-50' };
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    const icons = {
      roads: '🛣️',
      lighting: '💡',
      water: '💧',
      cleanliness: '🗑️',
      safety: '⚠️',
      obstructions: '🌳'
    };
    return icons[category] || '📋';
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get user status color
  const getUserStatusColor = (user) => {
    if (!user.isActive) return 'text-red-600';
    if (user.role === 'admin') return 'text-purple-600';
    return 'text-green-600';
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Admin privileges are required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-60 h-60 bg-indigo-200 rounded-full opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Shield className="text-white" size={24} />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            System Administration & Issue Management
          </p>
        </motion.div>

        {/* Admin Tabs */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'issues', label: 'Issue Management', icon: AlertCircle },
              { id: 'users', label: 'User Management', icon: Users }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100/50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Issues</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.issues?.total || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="text-white" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.users?.total || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <Users className="text-white" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Active Users</p>
                        <p className="text-3xl font-bold text-green-600">{stats.users?.active || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <UserCheck className="text-white" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm">Recent Issues</p>
                        <p className="text-3xl font-bold text-blue-600">{stats.issues?.recentIssues || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <AlertCircle className="text-white" size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed Stats */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Issue Status Breakdown */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Issue Status</h3>
                      <BarChart3 className="text-blue-500" size={20} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Reported</span>
                        <span className="font-semibold text-red-600">{stats.issues?.reported || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">In Progress</span>
                        <span className="font-semibold text-yellow-600">{stats.issues?.inProgress || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Resolved</span>
                        <span className="font-semibold text-green-600">{stats.issues?.resolved || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Closed</span>
                        <span className="font-semibold text-gray-600">{stats.issues?.closed || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* User Statistics */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">User Statistics</h3>
                      <Users className="text-green-500" size={20} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Users</span>
                        <span className="font-semibold text-gray-900">{stats.users?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Active Users</span>
                        <span className="font-semibold text-green-600">{stats.users?.active || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Admins</span>
                        <span className="font-semibold text-purple-600">{stats.users?.admins || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Verified</span>
                        <span className="font-semibold text-blue-600">{stats.users?.verified || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                      <Zap className="text-yellow-500" size={20} />
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowNotificationModal(true)}
                        className="w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        📢 Send Notification
                      </button>
                      <button
                        onClick={() => exportData('issues')}
                        className="w-full text-left text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        📊 Export Issues
                      </button>
                      <button
                        onClick={() => exportData('users')}
                        className="w-full text-left text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        👥 Export Users
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Distribution */}
              {stats?.categories && (
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Category Distribution</h3>
                    <BarChart3 className="text-purple-500" size={24} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.categories.map((category) => (
                      <div key={category._id} className="text-center">
                        <div className="text-2xl mb-2">{getCategoryIcon(category._id)}</div>
                        <div className="text-sm font-medium text-gray-900 capitalize">{category._id}</div>
                        <div className="text-lg font-bold text-blue-600">{category.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'issues' && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Controls */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Filter */}
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Status</option>
                      <option value="reported">Reported</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="createdAt">Newest First</option>
                      <option value="title">Title A-Z</option>
                      <option value="status">Status</option>
                      <option value="category">Category</option>
                    </select>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={fetchIssues}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={18} />
                      <span>Refresh</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => exportData('issues')}
                      className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={18} />
                      <span>Export</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Issues Table */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading issues...</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Issue</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Category</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reporter</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <AnimatePresence>
                          {issues.map((issue, index) => {
                            const statusInfo = getStatusInfo(issue.status);
                            const StatusIcon = statusInfo.icon;
                            
                            return (
                              <motion.tr
                                key={issue._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="hover:bg-gray-50/50 transition-colors duration-200"
                              >
                                <td className="px-6 py-4">
                                  <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                                    {issue.location && (
                                      <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                                        <MapPin size={12} />
                                        <span>{issue.location.address || `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`}</span>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                                    <span className="text-sm font-medium text-gray-900 capitalize">{issue.category}</span>
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusInfo.color}`}></div>
                                    <span className="text-sm font-medium capitalize">{issue.status.replace('_', ' ')}</span>
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                      <User className="text-white" size={16} />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{issue.reporter?.name || 'Anonymous'}</p>
                                      <p className="text-xs text-gray-500">{issue.reporter?.email || 'No email'}</p>
                                    </div>
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-600">
                                    {formatDate(issue.createdAt)}
                                  </div>
                                </td>
                                
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <motion.button
                                      onClick={() => {
                                        setSelectedIssue(issue);
                                        setShowIssueModal(true);
                                      }}
                                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Eye size={16} />
                                    </motion.button>
                                    
                                    <motion.button
                                      onClick={() => updateIssueStatus(issue._id, 'in_progress')}
                                      disabled={updatingStatus === issue._id || issue.status === 'in_progress'}
                                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Clock size={16} />
                                    </motion.button>
                                    
                                    <motion.button
                                      onClick={() => updateIssueStatus(issue._id, 'resolved')}
                                      disabled={updatingStatus === issue._id || issue.status === 'resolved'}
                                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <CheckCircle size={16} />
                                    </motion.button>
                                    
                                    <motion.button
                                      onClick={() => deleteIssue(issue._id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Trash2 size={16} />
                                    </motion.button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <motion.button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Previous
                  </motion.button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <motion.button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* User Controls */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>

                    {/* Filter */}
                    <select
                      value={userFilter}
                      onChange={(e) => setUserFilter(e.target.value)}
                      className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="all">All Users</option>
                      <option value="user">Regular Users</option>
                      <option value="admin">Admins</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>

                  {/* Admin Actions */}
                  <div className="flex items-center space-x-3">
                    <motion.button
                      onClick={fetchUsers}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className={`${loading ? 'animate-spin' : ''}`} size={18} />
                      <span>Refresh</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => exportData('users')}
                      className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Download size={18} />
                      <span>Export</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading users...</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <AnimatePresence>
                          {users.map((user, index) => (
                            <motion.tr
                              key={user._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-gray-50/50 transition-colors duration-200"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                    <User className="text-white" size={20} />
                                  </div>
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  {user.role === 'admin' ? (
                                    <Crown className="text-purple-600" size={16} />
                                  ) : (
                                    <User className="text-blue-600" size={16} />
                                  )}
                                  <span className="text-sm font-medium capitalize">{user.role}</span>
                                </div>
                              </td>
                              
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  {user.isActive ? (
                                    <UserCheck className="text-green-600" size={16} />
                                  ) : (
                                    <UserX className="text-red-600" size={16} />
                                  )}
                                  <span className={`text-sm font-medium ${getUserStatusColor(user)}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                              
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-600">
                                  {formatDate(user.createdAt)}
                                </div>
                              </td>
                              
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    onClick={() => updateUserStatus(user._id, { isActive: !user.isActive })}
                                    className={`p-2 rounded-lg transition-colors duration-200 ${
                                      user.isActive 
                                        ? 'text-red-600 hover:bg-red-50' 
                                        : 'text-green-600 hover:bg-green-50'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {user.isActive ? <Lock size={16} /> : <Unlock size={16} />}
                                  </motion.button>
                                  
                                  <motion.button
                                    onClick={() => updateUserStatus(user._id, { role: user.role === 'admin' ? 'user' : 'admin' })}
                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Crown size={16} />
                                  </motion.button>
                                  
                                  <motion.button
                                    onClick={() => deleteUser(user._id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {userTotalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <motion.button
                    onClick={() => setUserCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={userCurrentPage === 1}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Previous
                  </motion.button>
                  
                  <span className="px-4 py-2 text-gray-600">
                    Page {userCurrentPage} of {userTotalPages}
                  </span>
                  
                  <motion.button
                    onClick={() => setUserCurrentPage(prev => Math.min(userTotalPages, prev + 1))}
                    disabled={userCurrentPage === userTotalPages}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}




        </AnimatePresence>
      </div>

      {/* Issue Detail Modal */}
      <AnimatePresence>
        {showIssueModal && selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowIssueModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedIssue.title}</h3>
                  <p className="text-gray-600">{selectedIssue.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Category</span>
                    <p className="text-gray-900 capitalize">{selectedIssue.category}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <p className="text-gray-900 capitalize">{selectedIssue.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Reporter</span>
                    <p className="text-gray-900">{selectedIssue.reporter?.name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Date</span>
                    <p className="text-gray-900">{formatDate(selectedIssue.createdAt)}</p>
                  </div>
                </div>
                
                {selectedIssue.location && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Location</span>
                    <p className="text-gray-900">{selectedIssue.location.address || `${selectedIssue.location.coordinates[1].toFixed(4)}, ${selectedIssue.location.coordinates[0].toFixed(4)}`}</p>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 pt-4">
                  <motion.button
                    onClick={() => updateIssueStatus(selectedIssue._id, 'in_progress')}
                    disabled={updatingStatus === selectedIssue._id || selectedIssue.status === 'in_progress'}
                    className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 disabled:opacity-50 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Clock size={16} />
                    <span>Start Progress</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => updateIssueStatus(selectedIssue._id, 'resolved')}
                    disabled={updatingStatus === selectedIssue._id || selectedIssue.status === 'resolved'}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle size={16} />
                    <span>Mark Resolved</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => deleteIssue(selectedIssue._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowNotificationModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Send Notification</h2>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Notification title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={notificationData.message}
                    onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={4}
                    placeholder="Notification message"
                  />
                </div>
                
                <div className="flex items-center space-x-3 pt-4">
                  <motion.button
                    onClick={sendNotification}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell size={16} />
                    <span>Send Notification</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setShowNotificationModal(false)}
                    className="px-4 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;