const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Middleware to check if MongoDB is connected
const checkMongoDB = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable. Please try again later.',
      error: 'MongoDB is not connected'
    });
  }
  next();
};

// Apply MongoDB check to all routes
router.use(checkMongoDB);

// @desc    Get all issues for homepage with comprehensive filtering
// @route   GET /api/issues
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      category, 
      lat, 
      lng, 
      radius, 
      limit = 50, 
      page = 1,
      sort = 'newest' // newest, oldest, most_voted, most_commented
    } = req.query;
    
    console.log('Received issue query params:', req.query);
    
    let query = { isActive: true };
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by location and radius (geospatial query)
    if (lat && lng && radius) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInKm = parseFloat(radius);
      const radiusInMeters = radiusInKm * 1000; // Convert km to meters
      
      console.log('Location filter:', { latitude, longitude, radiusInKm, radiusInMeters });
      
      // Validate coordinates
      if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusInMeters) ||
          latitude < -90 || latitude > 90 || 
          longitude < -180 || longitude > 180 ||
          radiusInMeters <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location parameters. Please provide valid lat, lng, and radius values.',
          received: { lat, lng, radius }
        });
      }
      
      // Use $geoWithin with $centerSphere instead of $near for better compatibility
      query.location = {
        $geoWithin: {
          $centerSphere: [[longitude, latitude], radiusInMeters / 6378137] // Convert meters to radians
        }
      };
    }
    
    console.log('MongoDB query:', JSON.stringify(query, null, 2));
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    let sortObject = {};
    switch (sort) {
      case 'oldest':
        sortObject = { createdAt: 1 };
        break;
      case 'most_voted':
        sortObject = { voteCount: -1, createdAt: -1 };
        break;
      case 'most_commented':
        sortObject = { commentCount: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortObject = { createdAt: -1 };
        break;
    }
    
    // Execute query with population
    const issues = await Issue.find(query)
      .populate({
        path: 'reportedBy',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'assignedTo',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'comments.user',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'upvotes',
        select: 'name',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'downvotes',
        select: 'name',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .sort(sortObject)
      .limit(parseInt(limit))
      .skip(skip);
    
    console.log(`Found ${issues.length} issues`);
    
    // Get total count for pagination
    const total = await Issue.countDocuments(query);
    
    // Format response for frontend
    const formattedIssues = issues.map(issue => ({
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
        address: issue.location.address
      },
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      images: issue.images,
      anonymous: issue.anonymous,
      reporter: issue.reportedBy ? {
        name: issue.reportedBy.name,
        email: issue.reportedBy.email
      } : { name: 'Anonymous', email: null },
      assignedTo: issue.assignedTo ? {
        name: issue.assignedTo.name,
        email: issue.assignedTo.email
      } : null,
      voteCount: issue.voteCount,
      upvotes: (issue.upvotes && Array.isArray(issue.upvotes)) ? issue.upvotes.length : 0,
      downvotes: (issue.downvotes && Array.isArray(issue.downvotes)) ? issue.downvotes.length : 0,
      commentCount: issue.commentCount,
      comments: (issue.comments && Array.isArray(issue.comments)) ? issue.comments.map(comment => ({
        id: comment._id,
        text: comment.text,
        createdAt: comment.createdAt,
        user: {
          name: comment.user.name,
          email: comment.user.email
        }
      })) : [],
      priority: issue.priority,
      estimatedResolutionTime: issue.estimatedResolutionTime,
      tags: issue.tags,
      isActive: issue.isActive,
      flags: [],
      followers: 0
    }));
    
    res.json({
      success: true,
      data: formattedIssues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        status: status || 'all',
        category: category || 'all',
        location: lat && lng ? { lat, lng, radius } : null,
        sort
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user's issues
// @route   GET /api/issues/my-issues
// @access  Private
router.get('/my-issues', protect, async (req, res) => {
  try {
    const { status, category, limit = 20, page = 1 } = req.query;
    
    let query = { reportedBy: req.user.id, isActive: true };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const skip = (page - 1) * limit;
    
    const issues = await Issue.find(query)
      .populate({
        path: 'reportedBy',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'assignedTo',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'comments.user',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const total = await Issue.countDocuments(query);
    
    res.json({
      success: true,
      data: issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/issues/my-stats
// @access  Private
router.get('/my-stats', protect, async (req, res) => {
  try {
    const stats = await Issue.getUserStats(req.user.id);
    
    const userStats = stats[0] || {
      total: 0,
      reported: 0,
      inProgress: 0,
      resolved: 0,
      totalVotes: 0,
      totalComments: 0
    };
    
    res.json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get single issue
// @route   GET /api/issues/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate({
        path: 'reportedBy',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'assignedTo',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'comments.user',
        select: 'name email',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'upvotes',
        select: 'name',
        strictPopulate: false // Add this to fix the strictPopulate error
      })
      .populate({
        path: 'downvotes',
        select: 'name',
        strictPopulate: false // Add this to fix the strictPopulate error
      });
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Create new issue (supports both authenticated and anonymous)
// @route   POST /api/issues
// @access  Public (with optional auth)
router.post('/', [
  optionalAuth, // Make authentication optional
  [
    body('title', 'Title is required').notEmpty().trim(),
    body('description', 'Description is required').notEmpty().trim(),
    body('category', 'Valid category is required').isIn(['roads', 'lighting', 'water', 'cleanliness', 'safety', 'obstructions']),
    body('location.lat', 'Latitude is required').isFloat({ min: -90, max: 90 }),
    body('location.lng', 'Longitude is required').isFloat({ min: -180, max: 180 }),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical'])
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const {
      title,
      description,
      category,
      severity = 'medium',
      location,
      anonymous = false,
      images = []
    } = req.body;
    
    console.log('Creating issue with data:', req.body);
    
    // Validate coordinates
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid location coordinates are required',
        received: location
      });
    }
    
    // Prepare issue data with proper MongoDB geospatial format
    const issueData = {
      title,
      description,
      category,
      severity,
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat], // MongoDB format: [longitude, latitude]
        address: location.address || ''
      },
      anonymous,
      images
    };
    
    // Set reportedBy only if user is authenticated and not anonymous
    if (req.user && !anonymous) {
      issueData.reportedBy = req.user.id;
    }
    
    console.log('Saving issue to database:', issueData);
    
    const issue = new Issue(issueData);
    await issue.save();
    
    console.log('Issue saved successfully:', issue._id);
    
    // Populate reporter info if available
    if (issue.reportedBy) {
      await issue.populate('reportedBy', 'name email');
    }
    
    // Format response for frontend compatibility
    const formattedIssue = {
      _id: issue._id,
      id: issue._id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      severity: issue.severity,
      location: {
        lat: issue.location.coordinates[1],
        lng: issue.location.coordinates[0],
        address: issue.location.address
      },
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      images: issue.images,
      anonymous: issue.anonymous,
      reporter: issue.reportedBy ? {
        name: issue.reportedBy.name,
        email: issue.reportedBy.email
      } : { name: 'Anonymous', email: null },
      voteCount: issue.voteCount || 0,
      upvotes: 0,
      downvotes: 0,
      commentCount: issue.commentCount || 0,
      comments: [],
      flags: [],
      followers: 0
    };
    
    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: formattedIssue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating issue',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    // Check if user is owner or admin
    if (issue.reportedBy && issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this issue'
      });
    }
    
    const {
      title,
      description,
      category,
      severity,
      status,
      location,
      images
    } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (severity) updateData.severity = severity;
    if (status) updateData.status = status;
    if (images) updateData.images = images;
    
    // Handle location update with proper format
    if (location) {
      updateData.location = {
        type: 'Point',
        coordinates: [location.lng, location.lat],
        address: location.address || ''
      };
    }
    
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name email');
    
    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private (owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    // Check if user is owner or admin
    if (issue.reportedBy && issue.reportedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this issue'
      });
    }
    
    // Soft delete
    issue.isActive = false;
    await issue.save();
    
    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
router.post('/:id/comments', [
  protect,
  body('text', 'Comment text is required').notEmpty().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    await issue.addComment(req.user.id, req.body.text);
    
    await issue.populate('comments.user', 'name email');
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      data: issue.comments && Array.isArray(issue.comments) ? issue.comments[issue.comments.length - 1] : null
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Vote on issue
// @route   POST /api/issues/:id/vote
// @access  Private
router.post('/:id/vote', [
  protect,
  body('voteType', 'Vote type is required').isIn(['upvote', 'downvote'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }
    
    await issue.vote(req.user.id, req.body.voteType);
    
    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: {
        voteCount: issue.voteCount,
        upvotes: (issue.upvotes && Array.isArray(issue.upvotes)) ? issue.upvotes.length : 0,
        downvotes: (issue.downvotes && Array.isArray(issue.downvotes)) ? issue.downvotes.length : 0
      }
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get issue statistics
// @route   GET /api/issues/stats/overview
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          reported: {
            $sum: { $cond: [{ $eq: ['$status', 'reported'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          totalVotes: {
            $sum: { $subtract: [{ $size: '$upvotes' }, { $size: '$downvotes' }] }
          },
          totalComments: { $sum: { $size: '$comments' } }
        }
      }
    ]);
    
    const categoryStats = await Issue.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          total: 0,
          reported: 0,
          inProgress: 0,
          resolved: 0,
          totalVotes: 0,
          totalComments: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;