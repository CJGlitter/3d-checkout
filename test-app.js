/**
 * Test script for 3D Checkout Application
 * Simple tests to verify Braintree integration and basic functionality
 */

const http = require('http');

/**
 * Test the client token endpoint
 */
async function testClientToken() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/client-token',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success && response.clientToken) {
            console.log('✅ Client token endpoint test PASSED');
            resolve(response);
          } else {
            console.log('❌ Client token endpoint test FAILED:', response);
            reject(new Error('Invalid client token response'));
          }
        } catch (error) {
          console.log('❌ Client token endpoint test FAILED:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Client token endpoint test FAILED:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * Test the health endpoint
 */
async function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'OK') {
            console.log('✅ Health endpoint test PASSED');
            resolve(response);
          } else {
            console.log('❌ Health endpoint test FAILED:', response);
            reject(new Error('Health check failed'));
          }
        } catch (error) {
          console.log('❌ Health endpoint test FAILED:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Health endpoint test FAILED:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * Test the main page loads
 */
async function testMainPage() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200 && data.includes('3D Checkout Experience')) {
          console.log('✅ Main page test PASSED');
          resolve(data);
        } else {
          console.log('❌ Main page test FAILED');
          reject(new Error('Main page not loading correctly'));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Main page test FAILED:', error.message);
      reject(error);
    });

    req.end();
  });
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting 3D Checkout Application Tests...\n');

  try {
    // Test health endpoint
    await testHealthEndpoint();
    
    // Test main page
    await testMainPage();
    
    // Test client token (requires Braintree credentials)
    await testClientToken();
    
    console.log('\n🎉 All tests PASSED! The 3D Checkout Application is working correctly.');
    console.log('🌐 You can access the application at: http://localhost:3000');
    
  } catch (error) {
    console.log('\n❌ Some tests FAILED. Please check the application configuration.');
    console.log('Error details:', error.message);
    process.exit(1);
  }
}

// Wait a moment for the server to be ready, then run tests
setTimeout(runTests, 2000);
