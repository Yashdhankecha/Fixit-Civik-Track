const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3001', 'http://localhost:3002'], // Add both ports
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Mock data for testing
const mockIssues = [
  {
    _id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues',
    category: 'roads',
    status: 'reported',
    severity: 'high',
    location: {
      type: 'Point',
      coordinates: [72.9174295, 22.5641379] // [lng, lat] format for your location
    },
    images: [],
    reportedBy: 'user123',
    anonymous: false,
    upvotes: 5,
    downvotes: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    title: 'Broken Street Light',
    description: 'Street light not working for 3 days',
    category: 'lighting',
    status: 'in_progress',
    severity: 'medium',
    location: {
      type: 'Point',
      coordinates: [72.9180000, 22.5645000] // Nearby location
    },
    images: [],
    reportedBy: 'user123',
    anonymous: false,
    upvotes: 3,
    downvotes: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '3',
    title: 'Water Supply Issue',
    description: 'No water supply for 2 days',
    category: 'water',
    status: 'reported',
    severity: 'high',
    location: {
      type: 'Point',
      coordinates: [72.9170000, 22.5635000] // Another nearby location
    },
    images: [],
    reportedBy: 'user456',
    anonymous: false,
    upvotes: 8,
    downvotes: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Mock user data
const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'test@example.com',
  phone: '+91 8799038003',
  location: {
    type: 'Point',
    coordinates: [72.9174295, 22.5641379] // [lng, lat] format
  }
}

// Mock notifications data
const mockNotifications = [
  {
    _id: '1',
    title: 'Issue Update',
    message: 'Your reported pothole issue has been assigned to maintenance team',
    type: 'issue_update',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  {
    _id: '2',
    title: 'New Issue Nearby',
    message: 'A new water supply issue was reported 0.5km from your location',
    type: 'proximity',
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  {
    _id: '3',
    title: 'Issue Resolved',
    message: 'The street light issue you followed has been resolved',
    type: 'resolution',
    read: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  }
]

// Helper function to calculate distance between two points
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixIt Server is running (Mock Mode)',
    timestamp: new Date().toISOString(),
    version: '1.2.0', // Updated version to verify latest code
    features: {
      auth: true,
      notifications: true,
      geocoding: true,
      locationFiltering: true
    }
  })
})

// Mock issues endpoints
app.get('/api/issues', (req, res) => {
  const { lat, lng, radius, status, category, limit = 50, page = 1, sort = 'newest' } = req.query
  
  console.log('Received issue query params:', req.query);
  
  let filteredIssues = [...mockIssues]
  
  // Filter by status
  if (status && status !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.status === status)
  }
  
  // Filter by category
  if (category && category !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.category === category)
  }
  
  // Filter by location and radius
  if (lat && lng && radius) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);
    
    console.log('Location filter:', { userLat, userLng, radiusKm });
    
    if (!isNaN(userLat) && !isNaN(userLng) && !isNaN(radiusKm)) {
      filteredIssues = filteredIssues.filter(issue => {
        const issueLat = issue.location.coordinates[1]; // latitude
        const issueLng = issue.location.coordinates[0]; // longitude
        const distance = calculateDistance(userLat, userLng, issueLat, issueLng);
        console.log(`Issue ${issue._id}: distance = ${distance}km, within radius = ${distance <= radiusKm}`);
        return distance <= radiusKm;
      });
    }
  }
  
  // Format issues for frontend compatibility
  const formattedIssues = filteredIssues.map(issue => ({
    _id: issue._id,
    id: issue._id, // Add both for compatibility
    title: issue.title,
    description: issue.description,
    category: issue.category,
    status: issue.status,
    severity: issue.severity,
    location: {
      lat: issue.location.coordinates[1], // latitude
      lng: issue.location.coordinates[0], // longitude
      address: `${issue.location.coordinates[1].toFixed(4)}, ${issue.location.coordinates[0].toFixed(4)}`
    },
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    images: issue.images || [],
    anonymous: issue.anonymous,
    reporter: issue.reportedBy === 'user123' ? {
      name: mockUser.name,
      email: mockUser.email
    } : { name: 'Anonymous User', email: null },
    voteCount: (issue.upvotes || 0) - (issue.downvotes || 0),
    upvotes: issue.upvotes || 0,
    downvotes: issue.downvotes || 0,
    commentCount: 0,
    comments: [],
    flags: [],
    followers: Math.floor(Math.random() * 10)
  }));
  
  console.log(`Returning ${formattedIssues.length} filtered issues from ${mockIssues.length} total`);
  
  res.json({
    success: true,
    data: formattedIssues,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: formattedIssues.length,
      pages: Math.ceil(formattedIssues.length / parseInt(limit)),
      hasNext: false,
      hasPrev: false
    },
    filters: {
      status: status || 'all',
      category: category || 'all',
      location: lat && lng ? { lat, lng, radius } : null,
      sort
    },
    message: 'Issues fetched successfully'
  })
})

app.get('/api/issues/my-issues', (req, res) => {
  const userIssues = mockIssues.filter(issue => issue.reportedBy === 'user123')
  
  res.json({
    success: true,
    data: userIssues,
    message: 'User issues fetched successfully'
  })
})

app.get('/api/issues/my-stats', (req, res) => {
  const userIssues = mockIssues.filter(issue => issue.reportedBy === 'user123')
  
  const stats = {
    total: userIssues.length,
    reported: userIssues.filter(issue => issue.status === 'reported').length,
    inProgress: userIssues.filter(issue => issue.status === 'in_progress').length,
    resolved: userIssues.filter(issue => issue.status === 'resolved').length,
    totalVotes: userIssues.reduce((sum, issue) => sum + issue.upvotes + issue.downvotes, 0),
    totalComments: 0
  }
  
  res.json({
    success: true,
    data: stats,
    message: 'User stats fetched successfully'
  })
})

app.post('/api/issues', (req, res) => {
  const { title, description, category, severity, location, images, anonymous } = req.body
  
  const newIssue = {
    _id: Date.now().toString(),
    title,
    description,
    category,
    status: 'reported',
    severity,
    location: {
      type: 'Point',
      coordinates: [location.lng, location.lat]
    },
    images: images || [],
    reportedBy: 'user123',
    anonymous: anonymous || false,
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  mockIssues.push(newIssue)
  
  res.status(201).json({
    success: true,
    data: newIssue,
    message: 'Issue created successfully'
  })
})

// Mock auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  console.log('Login attempt:', { email, password: password ? '***' : undefined });
  
  if (email === 'test@example.com' && password === 'password') {
    console.log('Login successful for:', email);
    res.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token'
      },
      message: 'Login successful'
    })
  } else {
    console.log('Login failed - invalid credentials for:', email);
    res.status(401).json({
      success: false,
      message: 'Invalid credentials. Use test@example.com / password for demo.'
    })
  }
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body
  
  console.log('Registration attempt:', { name, email, password: password ? '***' : undefined });
  
  res.json({
    success: true,
    data: {
      user: mockUser,
      token: 'mock-jwt-token'
    },
    message: 'Registration successful'
  })
})

// Additional auth endpoints
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  
  console.log('Forgot password request for:', email);
  
  // Simulate sending reset email
  res.json({
    success: true,
    message: 'If an account with that email exists, we have sent a password reset link.'
  });
})

app.post('/api/auth/reset-password', (req, res) => {
  const { email, newPassword, token } = req.body;
  
  console.log('Password reset attempt for:', email);
  
  // Simulate password reset
  res.json({
    success: true,
    message: 'Password has been reset successfully. You can now log in with your new password.'
  });
})

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (token === 'mock-jwt-token') {
      res.json({
        success: true,
        data: {
          user: mockUser
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
})

app.post('/api/auth/logout', (req, res) => {
  // In a real app, you would invalidate the token
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
})

// Mock notification endpoints
app.get('/api/notifications/unread-count', (req, res) => {
  const unreadCount = mockNotifications.filter(notification => !notification.read).length;
  
  res.json({
    success: true,
    data: {
      count: unreadCount
    },
    message: 'Unread count fetched successfully'
  })
})

app.get('/api/notifications', (req, res) => {
  const { limit = 20, page = 1, unread } = req.query;
  
  let filteredNotifications = [...mockNotifications];
  
  if (unread === 'true') {
    filteredNotifications = filteredNotifications.filter(notification => !notification.read);
  }
  
  // Sort by creation date (newest first)
  filteredNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  res.json({
    success: true,
    data: filteredNotifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredNotifications.length,
      pages: Math.ceil(filteredNotifications.length / parseInt(limit))
    },
    message: 'Notifications fetched successfully'
  })
})

app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notification = mockNotifications.find(n => n._id === id);
  
  if (notification) {
    notification.read = true;
    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
})

app.put('/api/notifications/read-all', (req, res) => {
  mockNotifications.forEach(notification => {
    notification.read = true;
  });
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  })
})

// Geocoding proxy endpoints to avoid CORS issues
app.get('/api/geocode/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }
    
    // Try BigDataCloud first (more reliable)
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && (data.locality || data.city)) {
          const addressParts = [];
          if (data.locality) addressParts.push(data.locality);
          if (data.city && data.city !== data.locality) addressParts.push(data.city);
          if (data.principalSubdivision) addressParts.push(data.principalSubdivision);
          if (data.countryName) addressParts.push(data.countryName);
          
          return res.json({
            success: true,
            data: {
              address: addressParts.join(', '),
              components: data
            }
          });
        }
      }
    } catch (error) {
      console.error('BigDataCloud geocoding failed:', error.message);
    }
    
    // Fallback to coordinate-based address
    res.json({
      success: true,
      data: {
        address: `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`,
        components: { lat: parseFloat(lat), lng: parseFloat(lng) }
      }
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Geocoding service unavailable'
    });
  }
})

app.get('/api/geocode/forward', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required'
      });
    }
    
    // Check if it's already coordinates
    const coordPattern = /^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/;
    const match = address.match(coordPattern);
    if (match) {
      return res.json({
        success: true,
        data: {
          lat: parseFloat(match[1]),
          lng: parseFloat(match[2]),
          display_name: address,
          accuracy: 1.0
        }
      });
    }
    
    // Try BigDataCloud geocoding
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/forward-geocode-client?query=${encodeURIComponent(address)}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.results && data.results.length > 0) {
          const result = data.results[0];
          return res.json({
            success: true,
            data: {
              lat: parseFloat(result.latitude),
              lng: parseFloat(result.longitude),
              display_name: result.locality || address,
              accuracy: result.confidence || 0.5
            }
          });
        }
      }
    } catch (error) {
      console.error('Forward geocoding failed:', error.message);
    }
    
    res.status(404).json({
      success: false,
      message: 'Location not found'
    });
  } catch (error) {
    console.error('Forward geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Geocoding service unavailable'
    });
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: 'Something went wrong!' 
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found' 
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 FixIt Server running on port ${PORT} (Mock Mode)`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log(`📝 Using mock data - no database required`)
}) 