const express = require('express')
const router = express.Router()
<<<<<<< HEAD
const multer = require('multer')
const path = require('path')
const fs = require('fs')
=======
>>>>>>> d2575956032c14c6cd0435f3da67d7280a4a277c

const User = require('../models/User')
const { generateToken } = require('../utils/jwtUtils')
const { protect } = require('../middleware/auth')
const {
  validateSignUp,
  validateSignIn,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation')

<<<<<<< HEAD
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/profile-pictures')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

=======
>>>>>>> d2575956032c14c6cd0435f3da67d7280a4a277c
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

<<<<<<< HEAD
// @route   PUT /api/auth/profile/picture
// @desc    Upload profile picture
// @access  Private
router.put('/profile/picture', protect, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      })
    }

    // Delete old profile picture if exists
    if (req.user.profilePicture) {
      const oldPicturePath = path.join(__dirname, '..', req.user.profilePicture)
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath)
      }
    }

    // Update user with new profile picture path
    const picturePath = '/uploads/profile-pictures/' + req.file.filename
    req.user.profilePicture = picturePath
    await req.user.save()

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: req.user
    })
  } catch (error) {
    console.error('FixIt Profile picture upload error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during profile picture upload'
    })
  }
})

// @route   DELETE /api/auth/profile/picture
// @desc    Remove profile picture
// @access  Private
router.delete('/profile/picture', protect, async (req, res) => {
  try {
    if (!req.user.profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture to remove'
      })
    }

    // Delete the file from server
    const picturePath = path.join(__dirname, '..', req.user.profilePicture)
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath)
    }

    // Remove profile picture reference from user
    req.user.profilePicture = null
    await req.user.save()

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
      user: req.user
    })
  } catch (error) {
    console.error('FixIt Profile picture removal error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during profile picture removal'
    })
  }
})

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, phone, bio, preferences } = req.body;
    
    // Check if email is being changed and if it's already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
    }
    
    // Update user fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (bio !== undefined) updateFields.bio = bio;
    if (preferences !== undefined) updateFields.preferences = preferences;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('FixIt Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    // Verify current password
    const user = await User.findById(req.user._id).select('+password');
    const isPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('FixIt Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @route   DELETE /api/auth/delete-account
// @desc    Delete user account
// @access  Private
router.delete('/delete-account', protect, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }
    
    // Verify password
    const user = await User.findById(req.user._id).select('+password');
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }
    
    // Delete user's notifications
    const Notification = require('../models/Notification');
    await Notification.deleteMany({ userId: req.user._id });
    
    // Delete user's issues (if any)
    const Issue = require('../models/Issue');
    await Issue.deleteMany({ reporter: req.user._id });
    
    // Delete user's profile picture if exists
    if (user.profilePicture) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', 'uploads', 'profile-pictures', user.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete user account
    await User.findByIdAndDelete(req.user._id);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('FixIt Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during account deletion'
    });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { notifications, privacy, appearance, location } = req.body;
    
    const updateFields = {};
    if (notifications !== undefined) updateFields['preferences.notifications'] = notifications;
    if (privacy !== undefined) updateFields['preferences.privacy'] = privacy;
    if (appearance !== undefined) updateFields['preferences.appearance'] = appearance;
    if (location !== undefined) updateFields['preferences.location'] = location;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('FixIt Preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during preferences update'
    });
  }
});

=======
>>>>>>> d2575956032c14c6cd0435f3da67d7280a4a277c
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