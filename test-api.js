/**
 * Quick API Test Script
 * Run: node test-api.js
 * Make sure server is running first!
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

let testToken = '';

// Simple HTTP request helper
function makeRequest(method, url, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 3000,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
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
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing Health Check...');
    const health = await makeRequest('GET', `${BASE_URL}/health`);
    if (health.status === 200 && health.data.status === 'OK') {
      console.log('   ✅ Health check passed');
    } else {
      console.log('   ❌ Health check failed:', health.status, health.data);
      return;
    }

    // Test 2: Register User
    console.log('\n2️⃣  Testing User Registration...');
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      firstName: 'Test',
      lastName: 'User',
      role: 'HR_MANAGER'
    };
    const register = await makeRequest('POST', `${API_URL}/auth/register`, registerData);
    if (register.status === 201 && register.data.token) {
      testToken = register.data.token;
      console.log('   ✅ User registered:', register.data.user.email);
      console.log('   ✅ Token received');
    } else {
      console.log('   ❌ Registration failed:', register.status, register.data);
      if (register.status === 400 && register.data.message?.includes('already exists')) {
        console.log('   ⚠️  User already exists, trying login...');
        const login = await makeRequest('POST', `${API_URL}/auth/login`, {
          email: registerData.email,
          password: registerData.password
        });
        if (login.status === 200 && login.data.token) {
          testToken = login.data.token;
          console.log('   ✅ Logged in successfully');
        } else {
          return;
        }
      } else {
        return;
      }
    }

    // Test 3: Get Onboarding Checklists
    console.log('\n3️⃣  Testing Get Checklists...');
    const checklists = await makeRequest('GET', `${API_URL}/onboarding/checklists`, null, testToken);
    if (checklists.status === 200) {
      console.log(`   ✅ Checklists retrieved: ${Array.isArray(checklists.data) ? checklists.data.length : 0} items`);
    } else {
      console.log('   ❌ Failed to get checklists:', checklists.status, checklists.data);
    }

    // Test 4: Get Employees
    console.log('\n4️⃣  Testing Get Employees...');
    const employees = await makeRequest('GET', `${API_URL}/employees`, null, testToken);
    if (employees.status === 200) {
      console.log(`   ✅ Employees retrieved: ${Array.isArray(employees.data) ? employees.data.length : 0} items`);
    } else {
      console.log('   ❌ Failed to get employees:', employees.status, employees.data);
    }

    // Test 5: Get Notifications
    console.log('\n5️⃣  Testing Get Notifications...');
    const notifications = await makeRequest('GET', `${API_URL}/notifications`, null, testToken);
    if (notifications.status === 200) {
      console.log(`   ✅ Notifications retrieved: ${Array.isArray(notifications.data) ? notifications.data.length : 0} items`);
    } else {
      console.log('   ❌ Failed to get notifications:', notifications.status, notifications.data);
    }

    // Test 6: Get Unread Count
    console.log('\n6️⃣  Testing Get Unread Count...');
    const unread = await makeRequest('GET', `${API_URL}/notifications/unread-count`, null, testToken);
    if (unread.status === 200 && unread.data.unreadCount !== undefined) {
      console.log(`   ✅ Unread count: ${unread.data.unreadCount}`);
    } else {
      console.log('   ❌ Failed to get unread count:', unread.status, unread.data);
    }

    // Test 7: Test Invalid Token
    console.log('\n7️⃣  Testing Invalid Token (Should Fail)...');
    const invalid = await makeRequest('GET', `${API_URL}/onboarding/checklists`, null, 'invalid-token');
    if (invalid.status === 401) {
      console.log('   ✅ Correctly rejected invalid token');
    } else {
      console.log('   ⚠️  Invalid token not rejected:', invalid.status);
    }

    console.log('\n✅ All tests completed!');
    console.log('\n📝 Next Steps:');
    console.log('   - Test POST endpoints (create checklist, onboarding, etc.)');
    console.log('   - Test file upload (documents)');
    console.log('   - Verify MongoDB data in Atlas dashboard');
    console.log(`   - Token for manual testing: ${testToken.substring(0, 20)}...`);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Server is running (npm start or npm run dev)');
    console.log('   2. MongoDB Atlas connection is configured in .env');
    console.log('   3. .env file exists with MONGODB_URI');
  }
}

// Check if server is accessible first
console.log('🔍 Checking if server is running...\n');
runTests();

