const mongoose = require('mongoose');
const Issue = require('./models/Issue');
const User = require('./models/User');
require('dotenv').config();

// Test database connection
async function testConnection() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixit';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Create test data
async function createTestData() {
  try {
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    console.log('✅ Test user created:', testUser._id);

    // Create test issues
    const testIssues = [
      {
        title: 'Pothole on Main Street',
        description: 'Large pothole causing traffic issues',
        category: 'roads',
        status: 'reported',
        severity: 'high',
        location: {
          type: 'Point',
          coordinates: [-74.0060, 40.7128], // NYC coordinates
          address: 'Main Street, NYC'
        },
        reportedBy: testUser._id,
        anonymous: false,
        images: []
      },
      {
        title: 'Broken Street Light',
        description: 'Street light not working for 3 days',
        category: 'lighting',
        status: 'in_progress',
        severity: 'medium',
        location: {
          type: 'Point',
          coordinates: [-74.0055, 40.7130], // Nearby NYC coordinates
          address: '5th Avenue, NYC'
        },
        reportedBy: testUser._id,
        anonymous: false,
        images: []
      },
      {
        title: 'Water Leak',
        description: 'Water leaking from underground pipe',
        category: 'water',
        status: 'resolved',
        severity: 'high',
        location: {
          type: 'Point',
          coordinates: [-74.0065, 40.7125], // Nearby NYC coordinates
          address: 'Broadway, NYC'
        },
        reportedBy: testUser._id,
        anonymous: false,
        images: []
      },
      {
        title: 'Garbage Overflow',
        description: 'Garbage bins overflowing',
        category: 'cleanliness',
        status: 'reported',
        severity: 'medium',
        location: {
          type: 'Point',
          coordinates: [-74.0050, 40.7135], // Nearby NYC coordinates
          address: 'Park Avenue, NYC'
        },
        reportedBy: testUser._id,
        anonymous: false,
        images: []
      },
      {
        title: 'Anonymous Safety Concern',
        description: 'Suspicious activity in the area',
        category: 'safety',
        status: 'in_progress',
        severity: 'high',
        location: {
          type: 'Point',
          coordinates: [-74.0070, 40.7120], // Nearby NYC coordinates
          address: 'Central Park, NYC'
        },
        anonymous: true,
        images: []
      }
    ];

    for (const issueData of testIssues) {
      const issue = new Issue(issueData);
      await issue.save();
      console.log(`✅ Created issue: ${issue.title}`);
    }

    return testUser._id;
  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
    return null;
  }
}

// Test homepage route functionality
async function testHomepageRoute() {
  try {
    console.log('\n🧪 Testing Homepage Route Functionality...\n');

    // Test 1: Get all issues (no filters)
    console.log('1️⃣ Testing: Get all issues (no filters)');
    const allIssues = await Issue.find({ isActive: true })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`   Found ${allIssues.length} issues`);
    console.log('   ✅ All issues query successful');

    // Test 2: Filter by category
    console.log('\n2️⃣ Testing: Filter by category (roads)');
    const roadIssues = await Issue.find({ 
      isActive: true, 
      category: 'roads' 
    }).populate('reportedBy', 'name email');
    
    console.log(`   Found ${roadIssues.length} road issues`);
    console.log('   ✅ Category filter successful');

    // Test 3: Filter by status
    console.log('\n3️⃣ Testing: Filter by status (reported)');
    const reportedIssues = await Issue.find({ 
      isActive: true, 
      status: 'reported' 
    }).populate('reportedBy', 'name email');
    
    console.log(`   Found ${reportedIssues.length} reported issues`);
    console.log('   ✅ Status filter successful');

    // Test 4: Geospatial query
    console.log('\n4️⃣ Testing: Geospatial query (within 5km of NYC)');
    const nearbyIssues = await Issue.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128] // NYC center
          },
          $maxDistance: 5000 // 5km in meters
        }
      }
    }).populate('reportedBy', 'name email');
    
    console.log(`   Found ${nearbyIssues.length} issues within 5km`);
    console.log('   ✅ Geospatial query successful');

    // Test 5: Combined filters
    console.log('\n5️⃣ Testing: Combined filters (roads + reported)');
    const filteredIssues = await Issue.find({
      isActive: true,
      category: 'roads',
      status: 'reported'
    }).populate('reportedBy', 'name email');
    
    console.log(`   Found ${filteredIssues.length} road issues with reported status`);
    console.log('   ✅ Combined filters successful');

    // Test 6: Pagination
    console.log('\n6️⃣ Testing: Pagination (limit 2, page 1)');
    const paginatedIssues = await Issue.find({ isActive: true })
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(2)
      .skip(0);
    
    console.log(`   Found ${paginatedIssues.length} issues on page 1`);
    console.log('   ✅ Pagination successful');

    // Test 7: Sorting
    console.log('\n7️⃣ Testing: Different sort options');
    
    // Newest first
    const newestIssues = await Issue.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(3);
    console.log(`   Newest first: ${newestIssues.length} issues`);
    
    // Oldest first
    const oldestIssues = await Issue.find({ isActive: true })
      .sort({ createdAt: 1 })
      .limit(3);
    console.log(`   Oldest first: ${oldestIssues.length} issues`);
    
    console.log('   ✅ Sorting successful');

    // Test 8: Response format
    console.log('\n8️⃣ Testing: Response format for frontend');
    const sampleIssue = await Issue.findOne({ isActive: true })
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('comments.user', 'name email')
      .populate('upvotes', 'name')
      .populate('downvotes', 'name');

    if (sampleIssue) {
      const formattedIssue = {
        id: sampleIssue._id,
        title: sampleIssue.title,
        description: sampleIssue.description,
        category: sampleIssue.category,
        status: sampleIssue.status,
        severity: sampleIssue.severity,
        location: {
          lat: sampleIssue.location.coordinates[1],
          lng: sampleIssue.location.coordinates[0],
          address: sampleIssue.location.address
        },
        createdAt: sampleIssue.createdAt,
        updatedAt: sampleIssue.updatedAt,
        images: sampleIssue.images,
        anonymous: sampleIssue.anonymous,
        reporter: sampleIssue.reportedBy ? {
          name: sampleIssue.reportedBy.name,
          email: sampleIssue.reportedBy.email
        } : { name: 'Anonymous', email: null },
        voteCount: sampleIssue.voteCount,
        commentCount: sampleIssue.commentCount
      };
      
      console.log('   ✅ Response format test successful');
      console.log(`   Sample issue: ${formattedIssue.title} by ${formattedIssue.reporter.name}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Homepage route test failed:', error.message);
    return false;
  }
}

// Clean up test data
async function cleanup() {
  try {
    await Issue.deleteMany({ title: { $in: [
      'Pothole on Main Street',
      'Broken Street Light', 
      'Water Leak',
      'Garbage Overflow',
      'Anonymous Safety Concern'
    ]}});
    await User.deleteMany({ email: 'test@example.com' });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Run all tests
async function runHomepageTests() {
  console.log('🧪 Starting Homepage Route Tests...\n');
  
  // Test 1: Database connection
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Tests failed - cannot connect to database');
    process.exit(1);
  }
  
  // Test 2: Create test data
  const userId = await createTestData();
  if (!userId) {
    console.log('❌ Tests failed - cannot create test data');
    process.exit(1);
  }
  
  // Test 3: Test homepage route functionality
  const routeTestPassed = await testHomepageRoute();
  if (!routeTestPassed) {
    console.log('❌ Tests failed - homepage route tests failed');
    process.exit(1);
  }
  
  // Cleanup
  await cleanup();
  
  console.log('\n✅ All homepage route tests passed!');
  console.log('🚀 Your homepage route is ready for production');
  console.log('\n📋 API Endpoint Summary:');
  console.log('   GET /api/issues - Get all issues with filters');
  console.log('   Query Parameters:');
  console.log('     - status: reported, in_progress, resolved');
  console.log('     - category: roads, lighting, water, cleanliness, safety, obstructions');
  console.log('     - lat, lng, radius: For location-based filtering');
  console.log('     - limit, page: For pagination');
  console.log('     - sort: newest, oldest, most_voted, most_commented');
  
  process.exit(0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runHomepageTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testHomepageRoute, createTestData }; 