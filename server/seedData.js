const mongoose = require('mongoose');
const Issue = require('./models/Issue');
const User = require('./models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit';

const sampleIssues = [
  {
    title: 'Pothole on Main Street',
    description: 'Large pothole causing traffic issues and potential damage to vehicles.',
    category: 'roads',
    status: 'reported',
    severity: 'high',
    location: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128],
      address: 'Main Street, New York, NY'
    },
    images: [],
    anonymous: false,
    priority: 'high',
    estimatedResolutionTime: 5,
    tags: ['pothole', 'traffic', 'safety']
  },
  {
    title: 'Broken Street Light',
    description: 'Street light not working for the past 3 days, making the area unsafe at night.',
    category: 'lighting',
    status: 'in_progress',
    severity: 'medium',
    location: {
      type: 'Point',
      coordinates: [-74.0055, 40.7130],
      address: '5th Avenue, New York, NY'
    },
    images: [],
    anonymous: false,
    priority: 'medium',
    estimatedResolutionTime: 3,
    tags: ['lighting', 'safety', 'night']
  },
  {
    title: 'Water Leak on 5th Avenue',
    description: 'Water leaking from underground pipe, creating a small pond on the sidewalk.',
    category: 'water',
    status: 'resolved',
    severity: 'high',
    location: {
      type: 'Point',
      coordinates: [-74.0065, 40.7125],
      address: '5th Avenue, New York, NY'
    },
    images: [],
    anonymous: false,
    priority: 'urgent',
    estimatedResolutionTime: 2,
    tags: ['water', 'leak', 'infrastructure']
  },
  {
    title: 'Garbage Not Collected',
    description: 'Garbage bins overflowing, attracting pests and creating unpleasant odors.',
    category: 'cleanliness',
    status: 'reported',
    severity: 'medium',
    location: {
      type: 'Point',
      coordinates: [-74.0050, 40.7135],
      address: 'Broadway, New York, NY'
    },
    images: [],
    anonymous: true,
    priority: 'medium',
    estimatedResolutionTime: 1,
    tags: ['garbage', 'cleanliness', 'health']
  },
  {
    title: 'Suspicious Activity in Park',
    description: 'Suspicious individuals loitering in the park after hours, making residents feel unsafe.',
    category: 'safety',
    status: 'in_progress',
    severity: 'high',
    location: {
      type: 'Point',
      coordinates: [-74.0070, 40.7120],
      address: 'Central Park, New York, NY'
    },
    images: [],
    anonymous: true,
    priority: 'high',
    estimatedResolutionTime: 7,
    tags: ['safety', 'security', 'park']
  },
  {
    title: 'Tree Branch Blocking Sidewalk',
    description: 'Large tree branch has fallen and is blocking the sidewalk, making it difficult for pedestrians.',
    category: 'obstructions',
    status: 'reported',
    severity: 'medium',
    location: {
      type: 'Point',
      coordinates: [-74.0045, 40.7140],
      address: 'Park Avenue, New York, NY'
    },
    images: [],
    anonymous: false,
    priority: 'medium',
    estimatedResolutionTime: 4,
    tags: ['tree', 'sidewalk', 'obstruction']
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing issues
    await Issue.deleteMany({});
    console.log('🗑️  Cleared existing issues');

    // Get a user to assign as reporter (assuming you have a user)
    const user = await User.findOne();
    if (!user) {
      console.log('⚠️  No user found. Please create a user first.');
      return;
    }

    // Create issues with the user as reporter
    const issuesWithUser = sampleIssues.map(issue => ({
      ...issue,
      reportedBy: user._id
    }));

    const createdIssues = await Issue.insertMany(issuesWithUser);
    console.log(`✅ Created ${createdIssues.length} sample issues`);

    // Display created issues
    createdIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.title} - ${issue.status}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    console.log('📊 You can now test the ProfilePage with real data');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seed function
seedData(); 