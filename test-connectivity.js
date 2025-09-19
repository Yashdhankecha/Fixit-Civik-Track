const axios = require('axios');

// Test basic connectivity to the server
async function testConnectivity() {
  console.log('Testing server connectivity...\n');

  try {
    // Test 1: Server health check
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health', {
      timeout: 5000
    });
    console.log('✅ Server health:', healthResponse.data);
  } catch (error) {
    console.log('❌ Server health failed:', error.message);
    console.log('🔧 Make sure the server is running on port 5000');
    return;
  }

  try {
    // Test 2: Location test endpoint
    console.log('\n2. Testing location endpoint...');
    const locationResponse = await axios.get('http://localhost:5000/api/test/location', {
      params: {
        lat: 40.7128,
        lng: -74.0060,
        radius: 3
      },
      timeout: 5000
    });
    console.log('✅ Location test:', locationResponse.data);
  } catch (error) {
    console.log('❌ Location test failed:', error.message);
  }

  try {
    // Test 3: Issues endpoint
    console.log('\n3. Testing issues endpoint...');
    const issuesResponse = await axios.get('http://localhost:5000/api/issues', {
      params: {
        lat: 40.7128,
        lng: -74.0060,
        radius: 3,
        status: 'all',
        category: 'all'
      },
      timeout: 10000
    });
    console.log('✅ Issues endpoint:', {
      success: issuesResponse.data.success,
      issueCount: issuesResponse.data.data?.length || 0,
      message: issuesResponse.data.message
    });
  } catch (error) {
    console.log('❌ Issues endpoint failed:', error.response?.data || error.message);
  }

  console.log('\n🎉 Connectivity test complete!');
}

testConnectivity().catch(console.error);