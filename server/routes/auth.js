const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const User = require('../models/User')
const { generateToken } = require('../utils/jwtUtils')
const { protect } = require('../middleware/auth')
const {
  validateSignUp,
  validateSignIn,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation')

// @route   POST /api/auth/register
// @desc    Register a new user (simplified for FixIt)
// @access  Public
router.post('/register', validateSignUp, async (req, res) => {
  try {
    const { name, email, password } = req.body
    console.log('FixIt Registration:', { name, email })

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create new user (simplified - no phone required for FixIt)
    const user = new User({
      name,
      email,
      password,
      phone: 'N/A', // Default for FixIt
      isEmailVerified: true, // Auto-verify for offline development
      isActive: true
    })

    await user.save()

    // Generate JWT token immediately
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: 'FixIt account created successfully!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive
        }
      }
    })
  } catch (error) {
    console.error('FixIt Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (simplified for FixIt)
// @access  Public
router.post('/login', validateSignIn, async (req, res) => {
  try {
    const { email, password } = req.body
    console.log('FixIt Login attempt:', { email })

    // Check if user exists
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = generateToken(user._id)

    res.json({
      success: true,
      message: 'Welcome back to FixIt!',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin
        }
      }
    })
  } catch (error) {
    console.error('FixIt Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset (simplified for FixIt)
// @access  Public
router.post('/forgot-password', validateForgotPassword, async (req, res) => {
  try {
    const { email } = req.body
    console.log('FixIt Password reset request:', { email })

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // For offline development, just return success
    // In production, you would send an actual email
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email (offline mode)'
    })
  } catch (error) {
    console.error('FixIt Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    })
  }
})

// @route   POST /api/auth/reset-password
// @desc    Reset password (simplified for FixIt)
// @access  Public
router.post('/reset-password', validateResetPassword, async (req, res) => {
  try {
    const { email, newPassword } = req.body
    console.log('FixIt Password reset:', { email })

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('FixIt Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    })
  } catch (error) {
    console.error('FixIt Get user error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user data'
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('FixIt Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    })
  }
})

module.exports = router 