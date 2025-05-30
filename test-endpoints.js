// test-endpoints.js - Test if server endpoints are working
const http = require('http');

function testEndpoint(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: responseData,
          headers: res.headers
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Server Endpoints\n');
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing GET /api/health');
    try {
      const healthResult = await testEndpoint('GET', '/api/health');
      console.log(`   Status: ${healthResult.status}`);
      console.log(`   Response: ${healthResult.data}`);
      console.log('   ✅ Health check passed\n');
    } catch (error) {
      console.log(`   ❌ Health check failed: ${error.message}\n`);
    }

    // Test 2: Test endpoint
    console.log('2️⃣ Testing GET /api/test');
    try {
      const testResult = await testEndpoint('GET', '/api/test');
      console.log(`   Status: ${testResult.status}`);
      console.log(`   Response: ${testResult.data}`);
      console.log('   ✅ Test endpoint passed\n');
    } catch (error) {
      console.log(`   ❌ Test endpoint failed: ${error.message}\n`);
    }

    // Test 3: Improve response endpoint
    console.log('3️⃣ Testing POST /api/improve-response');
    try {
      const improveData = {
        userQuery: "test question",
        badResponse: "bad answer"
      };
      const improveResult = await testEndpoint('POST', '/api/improve-response', improveData);
      console.log(`   Status: ${improveResult.status}`);
      console.log(`   Response: ${improveResult.data}`);
      console.log('   ✅ Improve response endpoint passed\n');
    } catch (error) {
      console.log(`   ❌ Improve response endpoint failed: ${error.message}\n`);
    }

    // Test 4: Feed knowledge endpoint
    console.log('4️⃣ Testing POST /api/feed-knowledge');
    try {
      const feedData = {
        question: "test knowledge question"
      };
      const feedResult = await testEndpoint('POST', '/api/feed-knowledge', feedData);
      console.log(`   Status: ${feedResult.status}`);
      console.log(`   Response: ${feedResult.data}`);
      console.log('   ✅ Feed knowledge endpoint passed\n');
    } catch (error) {
      console.log(`   ❌ Feed knowledge endpoint failed: ${error.message}\n`);
    }

    console.log('🎉 All tests completed!');
    console.log('\n📋 Summary:');
    console.log('   - If all tests passed: Server is working correctly');
    console.log('   - If tests failed: Server is not running or has issues');
    console.log('\n💡 Next steps:');
    console.log('   1. If server tests pass but thumbs down still fails:');
    console.log('      - Check browser console for client-side errors');
    console.log('      - Check if client is calling correct URL');
    console.log('   2. If server tests fail:');
    console.log('      - Make sure server is running (node debug-server.js)');
    console.log('      - Check if port 3000 is available');

  } catch (error) {
    console.log('💥 Test runner failed:', error.message);
  }
}

runTests();