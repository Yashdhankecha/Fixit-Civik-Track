const { verifyToken, extractToken } = require('../utils/jwtUtils')
const User = require('../models/User')

// Protect routes - require authentication
const protect = async (req, res, next) => {
  try {
    const token = extractToken(req)
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }
    
    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }
    
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      })
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      })
    }
    
    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error.'
    })
  }
}

// Optional authentication - doesn't require token but adds user if available
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req)
    
    if (token) {
      const decoded = verifyToken(token)
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-password')
        if (user && user.isActive) {
          req.user = user
        }
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

module.exports = {
  protect,
  optionalAuth
} 