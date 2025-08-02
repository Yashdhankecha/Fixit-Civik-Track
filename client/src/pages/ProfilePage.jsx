import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Activity, 
  Shield,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Settings,
  Sparkles,
  TrendingUp,
  Heart,
  Star,
  Camera,
  Phone,
  Globe,
  ArrowRight,
  Upload,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useIssue } from '../contexts/IssueContext';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { getUserIssues } = useIssue();
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [hasFetchedIssues, setHasFetchedIssues] = useState(false);

  useEffect(() => {
    const fetchUserIssues = async () => {
      try {
        const issues = await getUserIssues();
        setUserIssues(issues);
        setHasFetchedIssues(true);
      } catch (error) {
        console.error('Error fetching user issues:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.id && !hasFetchedIssues) {
      fetchUserIssues();
    } else if (!user) {
      setLoading(false);
      setUserIssues([]);
      setHasFetchedIssues(false);
    }
  }, [user?.id, hasFetchedIssues, getUserIssues]); // Only fetch once per user

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return 'from-red-500 to-pink-500';
      case 'in_progress':
        return 'from-yellow-500 to-orange-500';
      case 'resolved':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'reported':
        return <AlertCircle size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

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

  const formatMemberSince = (createdAt) => {
    if (!createdAt) return 'N/A';
    
    const date = new Date(createdAt);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) {
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    } else if (months > 0) {
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return 'Today';
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.put('/api/auth/profile/picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Profile picture updated successfully!');
        // Update user context with new profile picture
        if (updateUser) {
          updateUser(response.data.user);
        }
      } else {
        throw new Error(response.data.message || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setUploadingImage(false);
      setShowImageUpload(false);
    }
  };

  const removeProfilePicture = async () => {
    try {
      const response = await api.delete('/api/auth/profile/picture');
      
      if (response.data.success) {
        toast.success('Profile picture removed successfully!');
        if (updateUser) {
          updateUser(response.data.user);
        }
      } else {
        throw new Error(response.data.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  const stats = {
    total: userIssues.length,
    reported: userIssues.filter(issue => issue.status === 'reported').length,
    inProgress: userIssues.filter(issue => issue.status === 'in_progress').length,
    resolved: userIssues.filter(issue => issue.status === 'resolved').length,
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'issues', label: 'My Issues', icon: Shield },
    { id: 'activity', label: 'Activity', icon: TrendingUp },
  ];

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
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Sparkles className="text-white" size={24} />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900">
              Profile
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage your account and track your contributions
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar Section */}
            <div className="text-center md:text-left">
              <div className="relative group">
                <motion.div 
                  className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl mx-auto md:mx-0 mb-4 overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                >
                  {user?.profilePicture ? (
                    <img 
                      src={`http://localhost:5000${user.profilePicture}`} 
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <User size={40} className="text-white" style={{ display: user?.profilePicture ? 'none' : 'flex' }} />
                </motion.div>
                
                {/* Upload overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => setShowImageUpload(true)}
                    className="text-white hover:text-blue-200 transition-colors duration-200"
                    title="Change profile picture"
                  >
                    <Camera size={24} />
                  </button>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user?.name || 'User Profile'}
              </h2>
              <p className="text-gray-600 mb-4">
                Community Contributor
              </p>
              
              <div className="flex flex-col space-y-2">
                <Link
                  to="/settings"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                >
                  <Settings size={16} />
                  <span>Edit Profile</span>
                </Link>
                
                {user?.profilePicture && (
                  <button
                    onClick={removeProfilePicture}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-200"
                  >
                    <X size={16} />
                    <span>Remove Picture</span>
                  </button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <Mail size={20} className="text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-semibold text-gray-900">{user?.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <Calendar size={20} className="text-green-600" />
                  <div>
                    <div className="text-sm text-gray-600">Member Since</div>
                    <div className="font-semibold text-gray-900">
                      {formatMemberSince(user?.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <Award size={20} className="text-purple-600" />
                  <div>
                    <div className="text-sm text-gray-600">Status</div>
                    <div className="font-semibold text-gray-900">Active</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                  <Heart size={20} className="text-orange-600" />
                  <div>
                    <div className="text-sm text-gray-600">Contributions</div>
                    <div className="font-semibold text-gray-900">{stats.total} Issues</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Image Upload Modal */}
        <AnimatePresence>
          {showImageUpload && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Update Profile Picture</h3>
                  <p className="text-gray-600 mb-6">Choose a new profile picture for your account</p>
                  
                  <div className="space-y-4">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      <div className="cursor-pointer inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200">
                        <Upload size={18} />
                        <span>{uploadingImage ? 'Uploading...' : 'Choose Image'}</span>
                      </div>
                    </label>
                    
                    <button
                      onClick={() => setShowImageUpload(false)}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      disabled={uploadingImage}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.total}</div>
            <div className="text-gray-600">Total Issues</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.reported}</div>
            <div className="text-gray-600">Reported</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.inProgress}</div>
            <div className="text-gray-600">In Progress</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{stats.resolved}</div>
            <div className="text-gray-600">Resolved</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex space-x-1 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {userIssues.slice(0, 3).map((issue, index) => (
                        <div key={issue._id || issue.id} className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl">
                          <div className={`w-8 h-8 bg-gradient-to-br ${getStatusColor(issue.status)} rounded-lg flex items-center justify-center`}>
                            {getStatusIcon(issue.status)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">{issue.title}</div>
                            <div className="text-xs text-gray-600">{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Achievements</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <Star size={16} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">First Report</div>
                          <div className="text-xs text-gray-600">Completed your first issue report</div>
                        </div>
                      </div>
                      {stats.total >= 5 && (
                        <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                            <Award size={16} className="text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Active Contributor</div>
                            <div className="text-xs text-gray-600">Reported 5+ issues</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'issues' && (
              <motion.div
                key="issues"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your issues...</p>
                  </div>
                ) : userIssues.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Plus size={32} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No Issues Yet</h3>
                    <p className="text-gray-600 mb-4">Start contributing to your community by reporting issues</p>
                    <Link
                      to="/report"
                      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    >
                      <Plus size={18} />
                      <span>Report Issue</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userIssues.map((issue) => (
                      <motion.div
                        key={issue._id || issue.id}
                        className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(issue.status)} rounded-2xl flex items-center justify-center text-2xl`}>
                              {getCategoryIcon(issue.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-bold text-gray-900">{issue.title}</h3>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(issue.status)} text-white`}>
                                  {issue.status.replace('_', ' ')}
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
                                <span>•</span>
                                <span>{issue.category}</span>
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/issue/${issue._id || issue.id}`}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200"
                          >
                            <span>View</span>
                            <ArrowRight size={16} />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Timeline</h3>
                  <div className="space-y-4">
                    {userIssues.map((issue, index) => (
                      <div key={issue._id || issue.id} className="flex items-start space-x-4">
                        <div className={`w-8 h-8 bg-gradient-to-br ${getStatusColor(issue.status)} rounded-full flex items-center justify-center mt-1`}>
                          {getStatusIcon(issue.status)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{issue.title}</div>
                          <div className="text-sm text-gray-600">{formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage; 