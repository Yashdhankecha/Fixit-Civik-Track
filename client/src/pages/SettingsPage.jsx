import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  MapPin, 
  Eye, 
  EyeOff,
  Lock,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Camera,
  Trash2,
  Upload
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateProfile, updatePreferences, logout } = useAuth();
  const { selectedLocation, updateRadius } = useLocation();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  const [notifications, setNotifications] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    push: user?.preferences?.notifications?.push ?? true,
    sms: user?.preferences?.notifications?.sms ?? false
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.preferences?.privacy?.profileVisibility || 'public',
    locationSharing: user?.preferences?.privacy?.locationSharing ?? true,
    anonymousReports: user?.preferences?.privacy?.anonymousReports ?? false
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteAccountData, setDeleteAccountData] = useState({
    confirmPassword: '',
    confirmText: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'account', label: 'Account', icon: Lock },
  ];

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileData);
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  const handlePreferencesUpdate = async (preferences) => {
    try {
      await updatePreferences(preferences);
    } catch (error) {
      console.error('Preferences update error:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }

      const response = await api.put('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (deleteAccountData.confirmText !== 'DELETE') {
        toast.error('Please type DELETE to confirm account deletion');
        return;
      }

      if (!deleteAccountData.confirmPassword) {
        toast.error('Please enter your password to confirm deletion');
        return;
      }

      const response = await api.delete('/api/auth/delete-account', {
        data: {
          password: deleteAccountData.confirmPassword
        }
      });

      if (response.data.success) {
        toast.success('Account deleted successfully');
        // Clear local storage first
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        // Then navigate to login
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
              <motion.button
                onClick={handleProfileUpdate}
                className="mt-6 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save size={18} />
                <span>Save Changes</span>
              </motion.button>
            </div>
          </motion.div>
        );

      case 'privacy':
        return (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">Profile Visibility</div>
                    <div className="text-sm text-gray-600">Control who can see your profile</div>
                  </div>
                  <select
                    value={privacy.profileVisibility}
                    onChange={async (e) => {
                      const newPrivacy = { ...privacy, profileVisibility: e.target.value };
                      setPrivacy(newPrivacy);
                      await handlePreferencesUpdate({ privacy: newPrivacy });
                    }}
                    className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="public">Public</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">Location Sharing</div>
                    <div className="text-sm text-gray-600">Share your location for better issue reporting</div>
                  </div>
                  <button
                    onClick={async () => {
                      const newPrivacy = { ...privacy, locationSharing: !privacy.locationSharing };
                      setPrivacy(newPrivacy);
                      await handlePreferencesUpdate({ privacy: newPrivacy });
                    }}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      privacy.locationSharing ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      privacy.locationSharing ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl">
                  <div>
                    <div className="font-semibold text-gray-900">Anonymous Reports</div>
                    <div className="text-sm text-gray-600">Submit reports without revealing your identity</div>
                  </div>
                  <button
                    onClick={async () => {
                      const newPrivacy = { ...privacy, anonymousReports: !privacy.anonymousReports };
                      setPrivacy(newPrivacy);
                      await handlePreferencesUpdate({ privacy: newPrivacy });
                    }}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      privacy.anonymousReports ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      privacy.anonymousReports ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'notifications':
        return (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Mail size={20} className="text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Email Notifications</div>
                      <div className="text-sm text-gray-600">Receive updates via email</div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newNotifications = { ...notifications, email: !notifications.email };
                      setNotifications(newNotifications);
                      await handlePreferencesUpdate({ notifications: newNotifications });
                    }}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      notifications.email ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Bell size={20} className="text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Push Notifications</div>
                      <div className="text-sm text-gray-600">Get real-time updates</div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newNotifications = { ...notifications, push: !notifications.push };
                      setNotifications(newNotifications);
                      await handlePreferencesUpdate({ notifications: newNotifications });
                    }}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      notifications.push ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      notifications.push ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/80 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Phone size={20} className="text-purple-600" />
                    <div>
                      <div className="font-semibold text-gray-900">SMS Notifications</div>
                      <div className="text-sm text-gray-600">Receive text message updates</div>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const newNotifications = { ...notifications, sms: !notifications.sms };
                      setNotifications(newNotifications);
                      await handlePreferencesUpdate({ notifications: newNotifications });
                    }}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      notifications.sms ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'location':
        return (
          <motion.div
            key="location"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Location Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/80 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <MapPin size={20} className="text-orange-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Current Location</div>
                      <div className="text-sm text-gray-600">
                        {selectedLocation ? `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}` : 'Not set'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-white/80 rounded-xl">
                  <div className="font-semibold text-gray-900 mb-3">Search Radius</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 3, 5, 10].map((radius) => (
                      <button
                        key={radius}
                        onClick={() => updateRadius(radius)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedLocation?.radius === radius
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {radius}km
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      

      case 'account':
        return (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 border border-red-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account Management</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/80 rounded-xl">
                  <div className="flex items-center space-x-3 mb-3">
                    <Lock size={20} className="text-red-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Change Password</div>
                      <div className="text-sm text-gray-600">Update your account password</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Current password"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="New password"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm hover:bg-gray-200 transition-all duration-200"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span>{showPassword ? 'Hide' : 'Show'} Password</span>
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition-all duration-200"
                      >
                        <Lock size={16} />
                        <span>Change Password</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                                 <div className="p-4 bg-white/80 rounded-xl">
                   <div className="flex items-center space-x-3 mb-3">
                     <Trash2 size={20} className="text-red-600" />
                     <div>
                       <div className="font-semibold text-gray-900">Delete Account</div>
                       <div className="text-sm text-gray-600">Permanently delete your account and all data</div>
                     </div>
                   </div>
                   
                   {!showDeleteConfirm ? (
                     <button
                       onClick={() => setShowDeleteConfirm(true)}
                       className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-all duration-200"
                     >
                       Delete Account
                     </button>
                   ) : (
                     <div className="space-y-3">
                       <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                         <strong>Warning:</strong> This action cannot be undone. All your data, issues, and preferences will be permanently deleted.
                       </div>
                       
                       <input
                         type="password"
                         value={deleteAccountData.confirmPassword}
                         onChange={(e) => setDeleteAccountData({ ...deleteAccountData, confirmPassword: e.target.value })}
                         placeholder="Enter your password to confirm"
                         className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                       />
                       
                       <input
                         type="text"
                         value={deleteAccountData.confirmText}
                         onChange={(e) => setDeleteAccountData({ ...deleteAccountData, confirmText: e.target.value })}
                         placeholder="Type DELETE to confirm"
                         className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                       />
                       
                       <div className="flex space-x-2">
                         <button
                           onClick={handleDeleteAccount}
                           className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-all duration-200"
                         >
                           Confirm Delete
                         </button>
                         <button
                           onClick={() => {
                             setShowDeleteConfirm(false);
                             setDeleteAccountData({ confirmPassword: '', confirmText: '' });
                           }}
                           className="px-4 py-2 bg-gray-500 text-white rounded-xl text-sm font-medium hover:bg-gray-600 transition-all duration-200"
                         >
                           Cancel
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
                
                
                
                <motion.button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

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

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="text-white" size={24} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Settings
                </h1>
                <p className="text-gray-600">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
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
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              <AnimatePresence mode="wait">
                {renderTabContent()}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 