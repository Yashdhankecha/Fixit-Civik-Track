import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  MapPin, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Plus,
  Map,
  Home,
  Shield,
  Sparkles,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation as useLocationContext } from '../contexts/LocationContext';
import { useNotification } from '../contexts/NotificationContext';

const Navbar = ({ onMenuClick }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAdmin } = useAuth();
  const { selectedLocation, radius } = useLocationContext();
  const { unreadCount } = useNotification();
  const location = useLocation();

  const navigation = isAdmin ? [
    { name: 'Admin Dashboard', href: '/admin', icon: Shield },
  ] : [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Report', href: '/report', icon: Plus },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-xl shadow-2xl border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            {!isAdmin && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <Menu size={20} />
              </button>
            )}
            
            <Link to="/" className="flex items-center space-x-3">
              <motion.div 
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Sparkles className="text-white" size={20} />
              </motion.div>
              <span className="font-bold text-2xl text-gray-900">FixIt</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Location Indicator - Only show for non-admin users */}
            {!isAdmin && (
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <MapPin size={16} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  {selectedLocation ? `${radius}km radius` : 'Set location'}
                </span>
              </div>
            )}

        

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <User size={16} className="text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || 'User'}
                </span>
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-56 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 py-2 z-50"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {user?.email}
                      </p>
                    </div>
                    
                    {isAdmin ? (
                      <>
                        <div className="px-4 py-2 text-xs font-semibold text-blue-600 uppercase tracking-wide">
                          Admin Tools
                        </div>
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield size={16} />
                          <span>Admin Dashboard</span>
                        </Link>
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          System
                        </div>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={16} />
                          <span>Profile</span>
                        </Link>
                        
                        <Link
                          to="/notifications"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Bell size={16} />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="ml-auto px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-all duration-200"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </Link>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <div className="flex justify-around py-3">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 