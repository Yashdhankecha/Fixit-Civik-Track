const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
require('dotenv').config()

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixIt Mock Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: 'unavailable - using mock data'
  })
})

// Mock issues data
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
    updatedAt: new Date('2024-01-15T10:30:00Z),
    images: [],
    anonymous: false,
    reporter: { name: 'John Doe', email: 'john@example.com' },
    assignedTo: null,
    voteCount: 5,
    upvotes: 7,
    downvotes: 2,
    commentCount: 3,
    comments: [
      {
        id: 'c1',
        text: 'This is a serious issue that needs immediate attention.',
        createdAt: new Date('2024-01-15T11:00:00Z'),
        user: { name: 'Jane Smith', email: 'jane@example.com' }
      }
    ],
    priority: 'high',
    estimatedResolutionTime: 7,
    tags: ['pothole', 'road-damage'],
    isActive: true,
    flags: [],
    followers: 5
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
    images: [],
    anonymous: false,
    reporter: { name: 'Jane Smith', email: 'jane@example.com' },
    assignedTo: { name: 'City Maintenance', email: 'maintenance@city.gov' },
    voteCount: 3,
    upvotes: 5,
    downvotes: 2,
    commentCount: 2,
    comments: [],
    priority: 'medium',
    estimatedResolutionTime: 3,
    tags: ['lighting', 'safety'],
    isActive: true,
    flags: [],
    followers: 3
  }
];

// Mock notifications data
const mockNotifications = [
  {
    _id: 'n1',
    id: 'n1',
    userId: 'user123',
    type: 'issue_update',
    title: 'Issue Status Updated',
    message: 'Your reported issue "Pothole on Main Street" has been updated to "In Progress"',
    priority: 'medium',
    read: false,
    createdAt: new Date('2024-01-16T09:30:00Z'),
    icon: 'info'
  },
  {
    _id: 'n2',
    id: 'n2',
    userId: 'user123',
    type: 'comment',
    title: 'New Comment on Your Issue',
    message: 'Jane Smith commented on your issue "Broken Street Light"',
    priority: 'low',
    read: false,
    createdAt: new Date('2024-01-15T14:20:00Z'),
    icon: 'comment'
  }
];

// Mock user data
const mockUser = {
  id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  isEmailVerified: true,
  isActive: true,
  lastLogin: new Date()
};

// Mock auth routes
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'test@example.com' && password === 'password') {
    res.json({
      success: true,
      message: 'Welcome back to FixIt!',
      data: {
        token: 'mock-jwt-token',
        user: mockUser
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password. Try: test@example.com / password'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'FixIt account created successfully!',
    data: {
      token: 'mock-jwt-token',
      user: {
        ...mockUser,
        name: req.body.name,
        email: req.body.email
      }
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    res.json({
      success: true,
      data: {
        user: mockUser
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }
});

// Mock issues routes
app.get('/api/issues', (req, res) => {
  res.json({
    success: true,
    data: mockIssues,
    pagination: {
      page: 1,
      limit: 50,
      total: mockIssues.length,
      pages: 1,
      hasNext: false,
      hasPrev: false
    },
    filters: {
      status: 'all',
      category: 'all',
      location: null,
      sort: 'newest'
    }
  });
});

app.get('/api/issues/:id', (req, res) => {
  const issue = mockIssues.find(i => i.id === req.params.id);
  if (issue) {
    res.json({
      success: true,
      data: issue
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Issue not found'
    });
  }
});

app.post('/api/issues', (req, res) => {
  const newIssue = {
    ...req.body,
    _id: `issue-${Date.now()}`,
    id: `issue-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    voteCount: 0,
    upvotes: 0,
    downvotes: 0,
    commentCount: 0,
    comments: [],
    flags: [],
    followers: 0
  };
  
  res.status(201).json({
    success: true,
    message: 'Issue created successfully',
    data: newIssue
  });
});

// Mock notifications routes
app.get('/api/notifications', (req, res) => {
  res.json({
    success: true,
    data: {
      notifications: mockNotifications,
      pagination: {
        page: 1,
        limit: 20,
        total: mockNotifications.length,
        pages: 1
      }
    }
  });
});

app.get('/api/notifications/unread-count', (req, res) => {
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  res.json({
    success: true,
    data: { count: unreadCount }
  });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notification = mockNotifications.find(n => n.id === req.params.id);
  if (notification) {
    notification.read = true;
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }
});

app.put('/api/notifications/read-all', (req, res) => {
  mockNotifications.forEach(n => n.read = true);
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: { updatedCount: mockNotifications.length }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found' 
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 FixIt Mock Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log(`💡 This is a mock server for development without MongoDB`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})