import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Map, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  MapPin,
  Users,
  Activity,
  Search,
  ChevronDown,
  Filter,
  Eye,
  Calendar,
  Navigation
} from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext'; // Add this import
import IssueCard from '../components/IssueCard';

const HomePage = () => {
  const { filteredIssues, loading, getIssueStats } = useIssue();
  const { selectedLocation, radius } = useLocation();
  const { user } = useAuth(); // Get user from auth context
  const stats = getIssueStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDistance, setSelectedDistance] = useState('All');

  const recentIssues = filteredIssues.slice(0, 6);

  const categories = ['All', 'Streetlights', 'Road', 'Garbage Collection', 'Water', 'Safety'];
  const statuses = ['All', 'Reported', 'In Progress', 'Resolved'];
  const distances = ['All', '0-1 km', '1-3 km', '3-5 km', '5+ km'];

  const quickActions = [
    {
      title: 'Report Issue',
      description: 'Report a new civic problem',
      icon: Plus,
      href: '/report',
      color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'View Map',
      description: 'Explore issues on the map',
      icon: Map,
      href: '/map',
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      textColor: 'text-green-600'
    }
  ];

  const statusCards = [
    {
      title: 'New Issues',
      count: stats.reported,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'In Progress',
      count: stats.inProgress,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Resolved',
      count: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total',
      count: stats.total,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                FixIt
              </h1>
              <p className="text-gray-600">
                Track and report civic issues in your community
              </p>
            </div>
            {/* Show login button only if user is not logged in */}
            {!user && (
              <Link
                to="/login"
                className="bg-gradient-to-r from-red-500 to-orange-600 text-white px-6 py-3 rounded-full font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Login
              </Link>
            )}
          </div>
        </motion.div>

        {/* Filter and Search Bar */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Category Filter */}
            <div className="relative flex-1">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Status Filter */}
            <div className="relative flex-1">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Distance Filter */}
            <div className="relative flex-1">
              <select
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
              >
                {distances.map((distance) => (
                  <option key={distance} value={distance}>
                    {distance}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Issues"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 group hover:scale-105"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </motion.div>

        {/* Statistics */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {statusCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-2xl flex items-center justify-center`}>
                    <Icon size={24} className={card.color} />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {card.count}
                    </div>
                    <div className="text-sm text-gray-600">
                      {card.title}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Recent Issues */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Issues
            </h2>
            <Link
              to="/map"
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-2"
            >
              <span>View All</span>
              <Navigation size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : recentIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIssues.map((issue, index) => (
                <motion.div
                  key={issue._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <IssueCard issue={issue} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center shadow-2xl border border-white/20">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                No Issues Found
              </h3>
              <p className="text-gray-600 mb-6">
                No civic issues have been reported in your area yet.
              </p>
              <Link 
                to="/report" 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                Report First Issue
              </Link>
            </div>
          )}
        </motion.div>

        {/* Community Stats */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Community Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </div>
              <div className="text-gray-600">Resolution Rate</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.resolved}
              </div>
              <div className="text-gray-600">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity size={32} className="text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {stats.inProgress}
              </div>
              <div className="text-gray-600">Being Addressed</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;