const express = require('express');
const cors = require('cors');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3001'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mock data for testing
const mockIssues = [
  {
    _id: '1',
    id: '1',
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues and potential damage to vehicles.',
    category: 'roads',
    status: 'reported',
    severity: 'high',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: 'Main Street, New York, NY'
    },
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    reporter: { name: 'John Doe', email: 'john@example.com' },
    images: [],
    flags: [],
    followers: 5,
    anonymous: false,
    voteCount: 5,
    upvotes: 5,
    downvotes: 0,
    commentCount: 2,
    comments: []
  },
  {
    _id: '2',
    id: '2',
    title: 'Broken Street Light',
    description: 'Street light not working for the past 3 days, making the area unsafe at night.',
    category: 'lighting',
    status: 'in_progress',
    severity: 'medium',
    location: {
      lat: 40.7130,
      lng: -74.0055,
      address: '5th Avenue, New York, NY'
    },
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-16T09:20:00Z'),
    reporter: { name: 'Jane Smith', email: 'jane@example.com' },
    images: [],
    flags: [],
    followers: 3,
    anonymous: false,
    voteCount: 3,
    upvotes: 3,
    downvotes: 0,
    commentCount: 1,
    comments: []
  },
  {
    _id: '3',
    id: '3',
    title: 'Water Leak on Broadway',
    description: 'Water leaking from underground pipe, creating a small pond on the sidewalk.',
    category: 'water',
    status: 'resolved',
    severity: 'high',
    location: {
      lat: 40.7125,
      lng: -74.0065,
      address: 'Broadway, New York, NY'
    },
    createdAt: new Date('2024-01-10T08:15:00Z'),
    updatedAt: new Date('2024-01-12T14:30:00Z'),
    reporter: { name: 'Mike Johnson', email: 'mike@example.com' },
    images: [],
    flags: [],
    followers: 8,
    anonymous: false,
    voteCount: 8,
    upvotes: 8,
    downvotes: 0,
    commentCount: 3,
    comments: []
  },
  {
    _id: '4',
    id: '4',
    title: 'Garbage Not Collected',
    description: 'Garbage bins overflowing, attracting pests and creating unpleasant odors.',
    category: 'cleanliness',
    status: 'reported',
    severity: 'medium',
    location: {
      lat: 40.7135,
      lng: -74.0050,
      address: 'Park Avenue, New York, NY'
    },
    createdAt: new Date('2024-01-17T12:00:00Z'),
    updatedAt: new Date('2024-01-17T12:00:00Z'),
    reporter: { name: 'Sarah Wilson', email: 'sarah@example.com' },
    images: [],
    flags: [],
    followers: 2,
    anonymous: false,
    voteCount: 2,
    upvotes: 2,
    downvotes: 0,
    commentCount: 0,
    comments: []
  },
  {
    _id: '5',
    id: '5',
    title: 'Suspicious Activity in Park',
    description: 'Suspicious individuals loitering in the park after hours, making residents feel unsafe.',
    category: 'safety',
    status: 'in_progress',
    severity: 'high',
    location: {
      lat: 40.7120,
      lng: -74.0070,
      address: 'Central Park, New York, NY'
    },
    createdAt: new Date('2024-01-16T20:30:00Z'),
    updatedAt: new Date('2024-01-17T11:15:00Z'),
    reporter: { name: 'Anonymous', email: null },
    images: [],
    flags: [],
    followers: 12,
    anonymous: true,
    voteCount: 12,
    upvotes: 12,
    downvotes: 0,
    commentCount: 5,
    comments: []
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'FixIt Mock Server is running',
    timestamp: new Date().toISOString(),
    environment: 'development',
    mongodb: 'mock'
  });
});

// Test endpoint for location queries
app.get('/api/test/location', (req, res) => {
  const { lat, lng, radius } = req.query;
  
  res.json({
    success: true,
    message: 'Location test endpoint working',
    received: { lat, lng, radius },
    parsed: {
      lat: parseFloat(lat),
      lng: parseFloat(lng), 
      radius: parseFloat(radius)
    },
    valid: !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)) && !isNaN(parseFloat(radius))
  });
});

// Get all issues
app.get('/api/issues', (req, res) => {
  try {
    const { status, category, lat, lng, radius, limit = 50, page = 1, sort = 'newest' } = req.query;
    
    console.log('Received issue query params:', req.query);
    
    let filteredIssues = [...mockIssues];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredIssues = filteredIssues.filter(issue => issue.status === status);
    }
    
    // Filter by category
    if (category && category !== 'all') {
      filteredIssues = filteredIssues.filter(issue => issue.category === category);
    }
    
    // Simple distance filtering (within radius)
    if (lat && lng && radius) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const radiusKm = parseFloat(radius);
      
      if (!isNaN(userLat) && !isNaN(userLng) && !isNaN(radiusKm)) {
        filteredIssues = filteredIssues.filter(issue => {
          const distance = calculateDistance(
            userLat, userLng, 
            issue.location.lat, issue.location.lng
          );
          return distance <= radiusKm;
        });
      }
    }
    
    // Sort issues
    switch (sort) {
      case 'oldest':
        filteredIssues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'most_voted':
        filteredIssues.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case 'most_commented':
        filteredIssues.sort((a, b) => b.commentCount - a.commentCount);
        break;
      default: // newest
        filteredIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    console.log(`Returning ${filteredIssues.length} filtered issues`);
    
    res.json({
      success: true,
      data: filteredIssues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredIssues.length,
        pages: Math.ceil(filteredIssues.length / parseInt(limit)),
        hasNext: false,
        hasPrev: false
      },
      filters: {
        status: status || 'all',
        category: category || 'all',
        location: lat && lng ? { lat, lng, radius } : null,
        sort
      }
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues'
    });
  }
});

// Create new issue
app.post('/api/issues', (req, res) => {
  try {
    console.log('Creating issue with data:', req.body);
    
    const { title, description, category, severity = 'medium', location, anonymous = false } = req.body;
    
    if (!title || !description || !category || !location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    const newIssue = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      title,
      description,
      category,
      status: 'reported',
      severity,
      location,
      createdAt: new Date(),
      updatedAt: new Date(),
      reporter: anonymous ? { name: 'Anonymous', email: null } : { name: 'Test User', email: 'test@example.com' },
      images: [],
      flags: [],
      followers: 0,
      anonymous,
      voteCount: 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      comments: []
    };
    
    mockIssues.unshift(newIssue);
    
    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: newIssue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating issue'
    });
  }
});

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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 FixIt Mock Server running on port ${PORT}`);
  console.log(`🌍 Environment: development`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
  console.log(`📊 Using mock data (no database required)`);
});