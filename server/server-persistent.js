const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const fs = require('fs').promises
const path = require('path')

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

// Data storage files
const DATA_DIR = path.join(__dirname, 'data')
const ISSUES_FILE = path.join(DATA_DIR, 'issues.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR)
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true })
  }
}

// Load data from file
async function loadData(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // File doesn't exist or is empty, return default value
    return defaultValue
  }
}

// Save data to file
async function saveData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

// Initialize data with sample data if empty
async function initializeData() {
  await ensureDataDir()
  
  // Initialize issues
  let issues = await loadData(ISSUES_FILE)
  if (issues.length === 0) {
    issues = [
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    await saveData(ISSUES_FILE, issues)
  }
  
  // Initialize users
  let users = await loadData(USERS_FILE)
  if (users.length === 0) {
    users = [
      {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 8799038003',
        location: {
          type: 'Point',
          coordinates: [73.1906048, 22.298624]
        },
        createdAt: new Date().toISOString()
      }
    ]
    await saveData(USERS_FILE, users)
  }
  
  return { issues, users }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixIt Server is running (Persistent Mode)',
    timestamp: new Date().toISOString()
  })
})

// Get all issues
app.get('/api/issues', async (req, res) => {
  try {
    const { location, radius, status, category } = req.query
    const issues = await loadData(ISSUES_FILE)
    
    let filteredIssues = [...issues]
    
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
  } catch (error) {
    console.error('Error fetching issues:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issues'
    })
  }
})

// Get user's issues
app.get('/api/issues/my-issues', async (req, res) => {
  try {
    const issues = await loadData(ISSUES_FILE)
    const userIssues = issues.filter(issue => issue.reportedBy === 'user123')
    
    res.json({
      success: true,
      data: userIssues,
      message: 'User issues fetched successfully'
    })
  } catch (error) {
    console.error('Error fetching user issues:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user issues'
    })
  }
})

// Get user stats
app.get('/api/issues/my-stats', async (req, res) => {
  try {
    const issues = await loadData(ISSUES_FILE)
    const userIssues = issues.filter(issue => issue.reportedBy === 'user123')
    
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
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats'
    })
  }
})

// Create new issue
app.post('/api/issues', async (req, res) => {
  try {
    const { title, description, category, severity, location, images, anonymous } = req.body
    
    const issues = await loadData(ISSUES_FILE)
    
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    issues.push(newIssue)
    await saveData(ISSUES_FILE, issues)
    
    res.status(201).json({
      success: true,
      data: newIssue,
      message: 'Issue created successfully'
    })
  } catch (error) {
    console.error('Error creating issue:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create issue'
    })
  }
})

// Update issue
app.put('/api/issues/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const issues = await loadData(ISSUES_FILE)
    const issueIndex = issues.findIndex(issue => issue._id === id)
    
    if (issueIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      })
    }
    
    issues[issueIndex] = {
      ...issues[issueIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await saveData(ISSUES_FILE, issues)
    
    res.json({
      success: true,
      data: issues[issueIndex],
      message: 'Issue updated successfully'
    })
  } catch (error) {
    console.error('Error updating issue:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update issue'
    })
  }
})

// Delete issue
app.delete('/api/issues/:id', async (req, res) => {
  try {
    const { id } = req.params
    const issues = await loadData(ISSUES_FILE)
    
    const filteredIssues = issues.filter(issue => issue._id !== id)
    
    if (filteredIssues.length === issues.length) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      })
    }
    
    await saveData(ISSUES_FILE, filteredIssues)
    
    res.json({
      success: true,
      message: 'Issue deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting issue:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete issue'
    })
  }
})

// Mock auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (email === 'test@example.com' && password === 'password') {
      const users = await loadData(USERS_FILE)
      const user = users.find(u => u.email === 'john@example.com') || users[0]
      
      res.json({
        success: true,
        data: {
          user,
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
  } catch (error) {
    console.error('Error during login:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const users = await loadData(USERS_FILE)
    
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      phone: '+91 8799038003',
      location: {
        type: 'Point',
        coordinates: [73.1906048, 22.298624]
      },
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    await saveData(USERS_FILE, users)
    
    res.json({
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token'
      },
      message: 'Registration successful'
    })
  } catch (error) {
    console.error('Error during registration:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    })
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

// Initialize data and start server
async function startServer() {
  try {
    await initializeData()
    console.log('✅ Data initialized successfully')
    
    app.listen(PORT, () => {
      console.log(`🚀 FixIt Server running on port ${PORT} (Persistent Mode)`)
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🔗 API URL: http://localhost:${PORT}/api`)
      console.log(`💾 Data stored in: ${DATA_DIR}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer() 