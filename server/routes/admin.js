const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during admin verification'
    });
  }
};

// GET /api/admin/issues - Get all issues with full details
router.get('/issues', protect, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search, sortBy = 'createdAt' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObject = {};
    switch (sortBy) {
      case 'title':
        sortObject = { title: 1 };
        break;
      case 'status':
        sortObject = { status: 1 };
        break;
      case 'category':
        sortObject = { category: 1 };
        break;
      case 'createdAt':
      default:
        sortObject = { createdAt: -1 };
        break;
    }

    const issues = await Issue.find(query)
      .populate('reporter', 'name email profilePicture')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit))
      .select('title description category status createdAt location images statusLogs');

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      data: {
        issues,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Issues retrieved successfully'
    });
  } catch (error) {
    console.error('Admin get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issues'
    });
  }
});

// GET /api/admin/issue/:id - Get single issue details
router.get('/issue/:id', protect, requireAdmin, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporter', 'name email profilePicture');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: issue,
      message: 'Issue details retrieved successfully'
    });
  } catch (error) {
    console.error('Admin get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching issue details'
    });
  }
});

// PATCH /api/admin/issues/:id/status - Update issue status
router.patch('/issues/:id/status', protect, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    // Validate status
    const validStatuses = ['reported', 'in_progress', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: reported, in_progress, resolved, closed'
      });
    }

    // Find and update the issue
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Update status and add to statusLogs
    const statusLog = {
      status: status,
      changedAt: new Date().toISOString(),
      changedBy: req.user._id,
      adminNote: adminNote || ''
    };

    issue.status = status;
    issue.statusLogs = issue.statusLogs || [];
    issue.statusLogs.push(statusLog);

    await issue.save();

    // Populate reporter info for response
    await issue.populate('reporter', 'name email');

    res.json({
      success: true,
      data: issue,
      message: `Issue status updated to ${status}`
    });
  } catch (error) {
    console.error('Admin update issue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating issue status'
    });
  }
});

// DELETE /api/admin/issues/:id - Delete issue
router.delete('/issues/:id', protect, requireAdmin, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting issue'
    });
  }
});

// GET /api/admin/users - Get all users with pagination
router.get('/users', protect, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      },
      message: 'Users retrieved successfully'
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// GET /api/admin/user/:id - Get single user details
router.get('/user/:id', protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's issues
    const userIssues = await Issue.find({ reportedBy: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user,
        recentIssues: userIssues
      },
      message: 'User details retrieved successfully'
    });
  } catch (error) {
    console.error('Admin get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user details'
    });
  }
});

// PATCH /api/admin/users/:id - Update user status/role
router.patch('/users/:id', protect, requireAdmin, async (req, res) => {
  try {
    const { role, isActive, isEmailVerified } = req.body;
    
    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof isEmailVerified === 'boolean') updateData.isEmailVerified = isEmailVerified;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', protect, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's issues
    await Issue.deleteMany({ reportedBy: user._id });

    res.json({
      success: true,
      message: 'User and associated data deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// POST /api/admin/notifications - Send notification to all users
router.post('/notifications', protect, requireAdmin, async (req, res) => {
  try {
    const { title, message, type = 'admin' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Get all active users
    const users = await User.find({ isActive: true });
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      userId: user._id,
      title,
      message,
      type,
      read: false
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Notification sent to ${users.length} users`
    });
  } catch (error) {
    console.error('Admin send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending notification'
    });
  }
});

// GET /api/admin/stats - Get comprehensive admin dashboard statistics
router.get('/stats', protect, requireAdmin, async (req, res) => {
  try {
    // Issue statistics
    const totalIssues = await Issue.countDocuments();
    const reportedIssues = await Issue.countDocuments({ status: 'reported' });
    const inProgressIssues = await Issue.countDocuments({ status: 'in_progress' });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });
    const closedIssues = await Issue.countDocuments({ status: 'closed' });

    // User statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentIssues = await Issue.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Category distribution
    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Issue.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // System statistics
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ read: false });

    res.json({
      success: true,
      data: {
        issues: {
          total: totalIssues,
          reported: reportedIssues,
          inProgress: inProgressIssues,
          resolved: resolvedIssues,
          closed: closedIssues,
          recentIssues
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminUsers,
          verified: verifiedUsers,
          recentUsers
        },
        categories: categoryStats,
        monthlyTrends,
        notifications: {
          total: totalNotifications,
          unread: unreadNotifications
        },
        system: {
          uptime: '99.8%',
          responseTime: '120ms',
          storageUsed: '45.2 GB'
        }
      },
      message: 'Admin statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin statistics'
    });
  }
});

// GET /api/admin/export - Export data
router.get('/export', protect, requireAdmin, async (req, res) => {
  try {
    const { type } = req.query;
    
    let data;
    switch (type) {
      case 'issues':
        data = await Issue.find().populate('reporter', 'name email');
        break;
      case 'users':
        data = await User.find().select('-password');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type. Use "issues" or "users"'
        });
    }

    res.json({
      success: true,
      data,
      message: `${type} data exported successfully`
    });
  } catch (error) {
    console.error('Admin export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting data'
    });
  }
});

module.exports = router; 