import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Globe, AlertCircle } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';

const LocationPrompt = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { getCurrentLocation, requestLocationPermission, locationPermission } = useLocation();

  const handleGetLocation = async () => {
    setIsLoading(true);
    await getCurrentLocation();
    setIsLoading(false);
  };

  const handleManualLocation = () => {
    // This would open a location picker modal
    // For now, we'll just show an alert
    alert('Manual location selection will be implemented');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        className="card p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div
          className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <MapPin size={32} className="text-primary-600" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-2xl font-bold text-secondary-900 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Enable Location Access
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-secondary-600 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          To help you discover and report civic issues in your area, we need to know your location. 
          This helps us show you relevant issues within your neighborhood.
        </motion.p>

        {/* Permission Status */}
        {locationPermission === 'denied' && (
          <motion.div
            className="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-danger-600" />
              <span className="text-sm text-danger-700">
                Location access was denied. Please enable it in your browser settings.
              </span>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleGetLocation}
            disabled={isLoading}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="loading-spinner w-4 h-4"></div>
            ) : (
              <Navigation size={16} />
            )}
            <span>
              {isLoading ? 'Getting Location...' : 'Use Current Location'}
            </span>
          </button>

          <button
            onClick={handleManualLocation}
            className="w-full btn-outline flex items-center justify-center space-x-2"
          >
            <Globe size={16} />
            <span>Choose Location Manually</span>
          </button>
        </motion.div>

        {/* Info */}
        <motion.div
          className="mt-6 text-xs text-secondary-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Your location is only used to show relevant issues and is not shared with others.</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LocationPrompt; 