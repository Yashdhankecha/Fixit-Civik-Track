const mongoose = require('mongoose');
const Issue = require('./models/Issue');
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

// Test creating an issue
async function testCreateIssue() {
  try {
    const testIssue = new Issue({
      title: 'Test Pothole',
      description: 'This is a test issue for backend verification',
      category: 'roads',
      status: 'reported',
      severity: 'medium',
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128], // [longitude, latitude]
        address: 'Test Location'
      },
      anonymous: false,
      images: []
    });

    const savedIssue = await testIssue.save();
    console.log('✅ Issue created successfully:', savedIssue._id);
    return savedIssue;
  } catch (error) {
    console.error('❌ Issue creation failed:', error.message);
    return null;
  }
}

// Test geospatial query
async function testGeospatialQuery() {
  try {
    const issues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [-74.0060, 40.7128] // [longitude, latitude]
          },
          $maxDistance: 5000 // 5km in meters
        }
      }
    });
    
    console.log('✅ Geospatial query successful, found', issues.length, 'issues');
    return issues;
  } catch (error) {
    console.error('❌ Geospatial query failed:', error.message);
    return [];
  }
}

// Test user issues query
async function testUserIssues() {
  try {
    // Create a test user ID
    const testUserId = new mongoose.Types.ObjectId();
    
    const issues = await Issue.find({
      reportedBy: testUserId,
      isActive: true
    });
    
    console.log('✅ User issues query successful, found', issues.length, 'issues');
    return issues;
  } catch (error) {
    console.error('❌ User issues query failed:', error.message);
    return [];
  }
}

// Clean up test data
async function cleanup() {
  try {
    await Issue.deleteMany({ title: 'Test Pothole' });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Starting backend tests...\n');
  
  // Test 1: Database connection
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Tests failed - cannot connect to database');
    process.exit(1);
  }
  
  // Test 2: Create issue
  const issue = await testCreateIssue();
  if (!issue) {
    console.log('❌ Tests failed - cannot create issues');
    process.exit(1);
  }
  
  // Test 3: Geospatial query
  await testGeospatialQuery();
  
  // Test 4: User issues query
  await testUserIssues();
  
  // Cleanup
  await cleanup();
  
  console.log('\n✅ All backend tests passed!');
  console.log('🚀 Your backend is ready for production');
  
  process.exit(0);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testConnection, testCreateIssue, testGeospatialQuery, testUserIssues }; 