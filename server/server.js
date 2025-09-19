const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const issueRoutes = require('./routes/issues')
const notificationRoutes = require('./routes/notifications')
const adminRoutes = require('./routes/admin')
const { errorHandler } = require('./middleware/errorHandler')

const app = express()

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://your-fixit-app.netlify.app',
        'https://your-custom-domain.com'
      ] 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true
}))

// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' 
    ? (process.env.RATE_LIMIT_MAX || 1000) 
    : 5000, // Much higher limit for development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  skip: (req) => {
    // Skip rate limiting for health checks and static files
    return req.path === '/api/health' || req.path.startsWith('/uploads/');
  }
})
app.use('/api/', limiter)

// More lenient rate limiting for issues endpoint in development
if (process.env.NODE_ENV !== 'production') {
  const issuesLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500, // Increased to 500 requests per minute for development
    message: {
      error: 'Too many requests to issues endpoint, please try again later.'
    }
  })
  app.use('/api/issues', issuesLimiter)
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FixIt Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    renderUrl: process.env.RENDER_EXTERNAL_URL || 'Not set'
  })
})

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
  })
})

// Error handling middleware
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found' 
  })
})

// Database connection - Using local MongoDB for FixIt
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit'

// Set Mongoose options to handle strictPopulate
mongoose.set('strictPopulate', false);

// Check if MongoDB is available
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
  console.log('💡 Make sure MongoDB is running locally on port 27017')
  console.log('💡 Or set MONGODB_URI environment variable')
})

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to FixIt MongoDB Database')
  console.log(`📊 Database: ${MONGODB_URI}`)
})

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected')
})

// Attempt to connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  } catch (err) {
    console.error('❌ MongoDB connection error:', err)
    console.log('💡 Make sure MongoDB is running locally on port 27017')
    console.log('💡 Or set MONGODB_URI environment variable')
    console.log('💡 Server will continue running but database features will be unavailable')
    
    // Retry connection every 30 seconds
    setTimeout(connectDB, 30000)
  }
}

connectDB()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 FixIt Server running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API URL: http://localhost:${PORT}/api`)
  console.log(`📊 MongoDB Status: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed')
    process.exit(0)
  })
})