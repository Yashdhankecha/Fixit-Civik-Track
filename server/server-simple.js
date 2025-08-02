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
    : ['http://localhost:3001'],
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
    category: 'Roads',
    status: 'reported',
    severity: 'high',
    location: {
      type: 'Point',
      coordinates: [73.1906048, 22.298624]
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
    category: 'Street Lights',
    status: 'in_progress',
    severity: 'medium',
    location: {
      type: 'Point',
      coordinates: [73.1906048, 22.298624]
    },
    images: [],
    reportedBy: 'user123',
    anonymous: false,
    upvotes: 3,
    downvotes: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Mock user data
const mockUser = {
  _id: 'user123',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+91 8799038003',
  location: {
    type: 'Point',
    coordinates: [73.1906048, 22.298624]
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixIt Server is running (Mock Mode)',
    timestamp: new Date().toISOString()
  })
})

// Mock issues endpoints
app.get('/api/issues', (req, res) => {
  const { location, radius, status, category } = req.query
  
  let filteredIssues = [...mockIssues]
  
  if (status && status !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.status === status)
  }
  
  if (category && category !== 'all') {
    filteredIssues = filteredIssues.filter(issue => issue.category === category)
  }
  
  res.json({
    success: true,
    data: filteredIssues,
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
  
  if (email === 'test@example.com' && password === 'password') {
    res.json({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token'
      },
      message: 'Login successful'
    })
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    })
  }
})

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body
  
  res.json({
    success: true,
    data: {
      user: mockUser,
      token: 'mock-jwt-token'
    },
    message: 'Registration successful'
  })
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