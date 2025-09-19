import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  Filter, 
  MapPin, 
  Navigation, 
  Layers,
  ZoomIn,
  ZoomOut,
  Search,
  X,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Plus,
  Users,
  Activity,
  Maximize2,
  Minimize2,
  ArrowLeft
} from 'lucide-react';
import { useIssue } from '../contexts/IssueContext';
import { useLocation } from '../contexts/LocationContext';
import IssueDetailModal from '../components/IssueDetailModal';
import { formatDistanceToNow } from 'date-fns';

const MapPage = () => {
  const { filteredIssues, loading, setSelectedIssue, getIssueStats, filters, updateFilters } = useIssue();
  const { selectedLocation, radius, updateRadius } = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIssueModal, setSelectedIssueModal] = useState(null);
  const [mapCenter, setMapCenter] = useState([0, 0]);
  const [zoom, setZoom] = useState(13);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStats, setShowStats] = useState(false); // Changed default to false
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null); // Add map instance state

  const stats = getIssueStats();

  // Initialize local filter state with context filters
  useEffect(() => {
    setSelectedStatus(filters.status || 'all');
    setSelectedCategory(filters.category || 'all');
  }, [filters]);

  // Update context filters when local filters change
  useEffect(() => {
    updateFilters({
      status: selectedStatus,
      category: selectedCategory
    });
  }, [selectedStatus, selectedCategory, updateFilters]);

  // Set initial map center and zoom when location is available
  useEffect(() => {
    if (selectedLocation) {
      const newCenter = [selectedLocation.lat, selectedLocation.lng];
      setMapCenter(newCenter);
      setZoom(15);
      
      // Immediately update the map view if map instance is available
      if (mapInstance) {
        mapInstance.setView(newCenter, 15);
      }
    }
  }, [selectedLocation, mapInstance]);

  // Handle map initialization and updates
  useEffect(() => {
    if (mapInstance && selectedLocation) {
      // Use a small delay to ensure the map is fully initialized
      const timer = setTimeout(() => {
        const newCenter = [selectedLocation.lat, selectedLocation.lng];
        mapInstance.setView(newCenter, 15);
        setMapCenter(newCenter);
        setZoom(15);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [mapInstance, selectedLocation]);

  const getIssueIcon = (category, status) => {
    const baseSize = 28;
    const statusSize = status === 'resolved' ? 24 : baseSize;
    
    const categoryColors = {
      roads: '#f97316',
      lighting: '#eab308',
      water: '#3b82f6',
      cleanliness: '#8b5cf6',
      safety: '#ef4444',
      obstructions: '#10b981'
    };
    
    const color = categoryColors[category] || '#6b7280';
    
    return L.divIcon({
      html: `
        <div style="
          width: ${statusSize}px; 
          height: ${statusSize}px; 
          background: ${color}; 
          border: 3px solid white; 
          border-radius: 50%; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 12px;
        ">
          ${status === 'resolved' ? '✓' : ''}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [statusSize, statusSize],
      iconAnchor: [statusSize / 2, statusSize / 2],
    });
  };

  const handleMarkerClick = (issue) => {
    setSelectedIssue(issue);
    setSelectedIssueModal(issue);
  };

  const handleCloseModal = () => {
    setSelectedIssueModal(null);
  };

  const radiusOptions = [1, 3, 5, 10];

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Eye },
    { value: 'reported', label: 'Reported', icon: AlertCircle },
    { value: 'in_progress', label: 'In Progress', icon: Clock },
    { value: 'resolved', label: 'Resolved', icon: CheckCircle }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'roads', label: 'Roads' },
    { value: 'lighting', label: 'Streetlights' },
    { value: 'water', label: 'Water' },
    { value: 'cleanliness', label: 'Garbage Collection' },
    { value: 'safety', label: 'Safety' },
    { value: 'obstructions', label: 'Obstructions' }
  ];

  if (!selectedLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MapPin className="text-white" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Map</h3>
          <p className="text-gray-600">Setting up your location...</p>
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
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Map View
              </h1>
              <p className="text-gray-600">
                Explore and track civic issues in your area
              </p>
            </div>
            <motion.button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={20} />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 size={20} />
                  <span>Fullscreen</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Map Container */}
        <motion.div
          className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden ${
            isFullscreen ? 'fixed inset-4 z-50' : 'relative'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Map Header */}
          <div className="bg-white/90 backdrop-blur-xl p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">Interactive Map</h2>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{radius}km radius</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter size={18} />
                </motion.button>

                <motion.button
                  onClick={() => setShowStats(!showStats)}
                  className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Activity size={18} />
                </motion.button>

                <motion.button
                  onClick={() => {
                    // Center map on user's location
                    if (mapInstance && selectedLocation) {
                      mapInstance.setView([selectedLocation.lat, selectedLocation.lng], 15);
                      setZoom(15);
                    }
                  }}
                  className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Navigation size={18} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Map Area */}
          <div className={`relative ${isFullscreen ? 'h-[calc(100vh-8rem)]' : 'h-96'}`}>
            <MapContainer
              center={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : mapCenter}
              zoom={selectedLocation ? 15 : zoom}
              className="w-full h-full"
              whenCreated={setMapInstance} // Capture map instance when created
              key={`${selectedLocation?.lat}-${selectedLocation?.lng}`} // Force re-render when location changes
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User Location Circle */}
              {selectedLocation && (
                <Circle
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  radius={radius * 1000}
                  pathOptions={{
                    color: '#0ea5e9',
                    fillColor: '#0ea5e9',
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />
              )}

              {/* User Location Marker */}
              {selectedLocation && (
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={L.divIcon({
                    html: `
                      <div style="
                        width: 20px; 
                        height: 20px; 
                        background: #0ea5e9; 
                        border: 4px solid white; 
                        border-radius: 50%; 
                        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                      "></div>
                    `,
                    className: 'user-location-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10],
                  })}
                >
                  <Popup>
                    <div className="text-center p-2">
                      <div className="font-bold text-gray-900">Your Location</div>
                      <div className="text-sm text-gray-600">
                        {radius}km radius
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Issue Markers */}
              {filteredIssues.map((issue) => (
                <Marker
                  key={issue._id}
                  position={[issue.location.lat, issue.location.lng]}
                  icon={getIssueIcon(issue.category, issue.status)}
                  eventHandlers={{
                    click: () => handleMarkerClick(issue),
                  }}
                >
                  <Popup>
                    <div className="min-w-[250px] p-3">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          issue.status === 'reported' ? 'bg-red-100 text-red-800' :
                          issue.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                          {getCategoryLabel(issue.category)}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2">
                        {issue.title}
                      </h3>
                      {issue.images && issue.images.length > 0 && (
                        <div className="mb-2">
                          <img 
                            src={issue.images[0].url || issue.images[0]} 
                            alt="Issue" 
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          {issue.images.length > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              +{issue.images.length - 1} more images
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {issue.description}
                      </p>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading issues...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && !isFullscreen && (
            <motion.div
              className="absolute top-20 right-4 z-[1000] bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 w-80"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Map Statistics</h3>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                      <div className="text-sm text-gray-600">Total Issues</div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl">
                    <div className="text-xl font-bold text-red-600">{stats.reported}</div>
                    <div className="text-xs text-red-600">Reported</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                    <div className="text-xl font-bold text-yellow-600">{stats.inProgress}</div>
                    <div className="text-xs text-yellow-600">In Progress</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                    <div className="text-xl font-bold text-green-600">{stats.resolved}</div>
                    <div className="text-xs text-green-600">Resolved</div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <div className="text-xl font-bold text-purple-600">{radius}km</div>
                    <div className="text-xs text-purple-600">Radius</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && !isFullscreen && (
            <motion.div
              className="absolute top-20 left-4 z-[1000] bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 w-80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Status Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Status</label>
                  <div className="space-y-2">
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => setSelectedStatus(option.value)}
                          className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                            selectedStatus === option.value
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-sm font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Radius Control */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Radius</label>
                  <div className="grid grid-cols-2 gap-2">
                    {radiusOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => updateRadius(option)}
                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          radius === option
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option}km
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Issue Detail Modal */}
        <AnimatePresence>
          {selectedIssueModal && (
            <IssueDetailModal
              issue={selectedIssueModal}
              onClose={handleCloseModal}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Helper functions
const getCategoryLabel = (category) => {
  switch (category) {
    case 'roads':
      return 'Roads';
    case 'lighting':
      return 'Streetlights';
    case 'water':
      return 'Water Supply';
    case 'cleanliness':
      return 'Cleanliness';
    case 'safety':
      return 'Public Safety';
    case 'obstructions':
      return 'Obstructions';
    default:
      return category;
  }
};

export default MapPage;