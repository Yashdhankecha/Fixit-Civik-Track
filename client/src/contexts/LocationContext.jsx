import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Default location for development (New York City)
const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.0060 };

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState('prompt');
  const [locationLoading, setLocationLoading] = useState(false);
  const [radius, setRadius] = useState(3); // Default 3km radius

  // Get user's current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by your browser');
        // Use default location for development
        setUserLocation(DEFAULT_LOCATION);
        setSelectedLocation(DEFAULT_LOCATION);
        setLocationPermission('granted');
        localStorage.setItem('userLocation', JSON.stringify(DEFAULT_LOCATION));
        setLocationLoading(false);
        return;
      }

      // Get current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const location = { lat: latitude, lng: longitude };
      
      setUserLocation(location);
      setSelectedLocation(location);
      setLocationPermission('granted');
      
      // Store in localStorage for persistence
      localStorage.setItem('userLocation', JSON.stringify(location));
      
      toast.success('Location detected successfully');
    } catch (error) {
      console.error('Location error:', error);
      
      // Handle different error types
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setLocationPermission('denied');
          toast.error('Location permission denied. Using default location.');
          // Use default location for development
          setUserLocation(DEFAULT_LOCATION);
          setSelectedLocation(DEFAULT_LOCATION);
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error('Location information unavailable. Using default location.');
          setUserLocation(DEFAULT_LOCATION);
          setSelectedLocation(DEFAULT_LOCATION);
          break;
        case error.TIMEOUT:
          toast.error('Location request timed out. Using default location.');
          setUserLocation(DEFAULT_LOCATION);
          setSelectedLocation(DEFAULT_LOCATION);
          break;
        default:
          toast.error('Unable to get your location. Using default location.');
          setUserLocation(DEFAULT_LOCATION);
          setSelectedLocation(DEFAULT_LOCATION);
      }
      
      // Try to get location from localStorage
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          setUserLocation(location);
          setSelectedLocation(location);
          toast.info('Using saved location');
        } catch (e) {
          console.error('Error parsing saved location:', e);
        }
      }
    } finally {
      setLocationLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        setLocationPermission('granted');
        await getCurrentLocation();
      } else if (permission.state === 'prompt') {
        setLocationPermission('prompt');
        await getCurrentLocation();
      } else {
        setLocationPermission('denied');
        // Use default location for development
        setUserLocation(DEFAULT_LOCATION);
        setSelectedLocation(DEFAULT_LOCATION);
        toast.info('Using default location for demo');
      }
    } catch (error) {
      console.error('Permission request error:', error);
      // Use default location for development
      setUserLocation(DEFAULT_LOCATION);
      setSelectedLocation(DEFAULT_LOCATION);
      toast.info('Using default location for demo');
    }
  };

  const updateSelectedLocation = (location) => {
    setSelectedLocation(location);
  };

  const updateRadius = (newRadius) => {
    setRadius(newRadius);
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const isWithinRadius = (issueLocation) => {
    if (!selectedLocation || !issueLocation) return false;
    
    const distance = calculateDistance(
      selectedLocation.lat,
      selectedLocation.lng,
      issueLocation.lat,
      issueLocation.lng
    );
    
    return distance <= radius;
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Unknown location';
    }
  };

  const getCoordsFromAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  const value = {
    userLocation,
    selectedLocation,
    locationPermission,
    locationLoading,
    radius,
    getCurrentLocation,
    requestLocationPermission,
    updateSelectedLocation,
    updateRadius,
    calculateDistance,
    isWithinRadius,
    getAddressFromCoords,
    getCoordsFromAddress,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 