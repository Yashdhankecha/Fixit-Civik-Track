const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit';

const sampleNotifications = [
  {
    type: 'issue',
    title: 'New Issue Reported',
    message: 'A new pothole has been reported near your location',
    priority: 'high',
    location: 'Main Street, NYC',
    issueId: 'issue-123',
    icon: 'alert'
  },
  {
    type: 'comment',
    title: 'New Comment',
    message: 'John Doe commented on your reported issue',
    priority: 'medium',
    issueId: 'issue-456',
    icon: 'comment'
  },
  {
    type: 'vote',
    title: 'Issue Voted',
    message: 'Your issue received 5 new upvotes',
    priority: 'low',
    issueId: 'issue-789',
    icon: 'vote'
  },
  {
    type: 'system',
    title: 'Welcome to FixIt!',
    message: 'Thank you for joining our community. Start reporting issues to make your city better.',
    priority: 'medium',
    icon: 'info'
  },
  {
    type: 'issue',
    title: 'Issue Status Updated',
    message: 'Your reported issue has been marked as "In Progress"',
    priority: 'high',
    issueId: 'issue-101',
    icon: 'update'
  },
  {
    type: 'comment',
    title: 'Reply to Comment',
    message: 'Jane Smith replied to your comment on the street light issue',
    priority: 'medium',
    issueId: 'issue-202',
    icon: 'reply'
  }
];

async function seedNotifications() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the first user (or create one if none exists)
    let user = await User.findOne();
    if (!user) {
      console.log('No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`Seeding notifications for user: ${user.name}`);

    // Clear existing notifications for this user
    await Notification.deleteMany({ userId: user._id });
    console.log('Cleared existing notifications');

    // Create notifications with timestamps
    const notifications = sampleNotifications.map((notification, index) => ({
      ...notification,
      userId: user._id,
      read: index % 2 === 0, // Alternate read/unread
      createdAt: new Date(Date.now() - (index * 1000 * 60 * 60 * 2)), // 2 hours apart
      updatedAt: new Date(Date.now() - (index * 1000 * 60 * 60 * 2))
    }));

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} notifications`);

    console.log('Notification seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
}

seedNotifications(); 