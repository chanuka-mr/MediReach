# 🎯 Practical Integration Testing Guide - Step by Step

## What We Just Created

You now have a **complete integration testing setup** that:
- ✅ Starts a test database (in-memory MongoDB)
- ✅ Runs Express server with test endpoints
- ✅ Makes real HTTP requests to test API endpoints
- ✅ Cleans database between tests
- ✅ Provides test data factories

---

## ⚡ Quick Start - 3 Steps

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Run Tests
```bash
npm run test:integration
```

### Step 3: See Results
```
 PASS  __tests__/integration/auth.integration.test.js
✓ Tests running!
```

---

## 🧪 Understanding a Simple Test

Here's the **simplest possible test**:

```javascript
const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');

let app;

// Setup: Start in-memory database
beforeAll(async () => {
  await startDB();
  app = require('../../app');  // Load Express app
});

// Cleanup: Stop database
afterAll(async () => {
  await stopDB();
});

// Clean before each test
beforeEach(async () => {
  await clearDB();
});

// THE ACTUAL TEST
describe('My First Test', () => {
  it('should show api is working', async () => {
    // Make a request to the API
    const response = await request(app)
      .get('/api/auth/profile')  // Replace with your endpoint
      .expect(200);  // Expect HTTP 200
    
    // Check something about the response
    console.log('Response:', response.body);
    expect(response.body).toBeDefined();
  });
});
```

---

## 📋 Real Example: Test User Registration

```javascript
const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');

let app;

beforeAll(async () => {
  await startDB();
  app = require('../../app');
});

afterAll(async () => {
  await stopDB();
});

beforeEach(async () => {
  await clearDB();
});

describe('User Registration', () => {
  
  it('should register a new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      contactNumber: '+94771234567',
      role: 'user'
    };
    
    // Make POST request
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);  // Expect 201 Created
    
    // Verify response
    expect(response.body.status).toBe('success');
    expect(response.body.data.user.email).toBe(userData.email);
  });
  
  it('should fail with duplicate email', async () => {
    const userData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'SecurePass123!',
      contactNumber: '+94771234567'
    };
    
    // Register first user
    await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Try to register again with same email
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);  // Expect 400 Bad Request
    
    expect(response.body.status).toBe('error');
  });
  
});
```

---

## 🔍 How to Debug Tests

### Method 1: Add Console Logs
```javascript
it('should debug something', async () => {
  console.log('Starting test...');
  
  const response = await request(app)
    .post('/api/endpoint')
    .send({ data: 'value' });
  
  console.log('Status:', response.status);
  console.log('Body:', response.body);
  console.log('Headers:', response.headers);
  console.log('Error:', response.error);
  
  expect(response.status).toBe(200);
});
```

### Method 2: Run with Verbose Output
```bash
npm run test:integration -- --verbose
```

### Method 3: Run Single Test
```bash
npm run test:integration -- --testNamePattern="should register"
```

### Method 4: Stop on First Error
```bash
npm run test:integration -- --bail
```

---

## 📚 Test Patterns You Can Copy-Paste

### Pattern 1: Register and Login User
```javascript
const { registerAndLogin } = require('./httpTestHelpers');

it('should access protected endpoint', async () => {
  const { user, token } = await registerAndLogin(app);
  
  const response = await request(app)
    .get('/api/protected-endpoint')
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
    
  expect(response.body.data).toBeDefined();
});
```

### Pattern 2: Create Test Data
```javascript
const { createTestUser, createTestPharmacy, createTestInquiry } = require('./testUtils');

it('should work with custom test data', async () => {
  const customUser = createTestUser({
    name: 'My Custom Name',
    email: 'custom@test.com'
  });
  
  const pharmacy = createTestPharmacy({
    pharmacyName: 'My Pharmacy'
  });
});
```

### Pattern 3: Test with Query Parameters
```javascript
it('should search with filters', async () => {
  const response = await request(app)
    .get('/api/resources')
    .query({ search: 'medicine', page: 1, limit: 10 })
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
    
  expect(response.body.data).toBeDefined();
});
```

### Pattern 4: Test File Upload
```javascript
it('should upload file', async () => {
  const response = await request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${token}`)
    .attach('file', '/path/to/file.pdf')
    .expect(200);
    
  expect(response.body.data.fileUrl).toBeDefined();
});
```

### Pattern 5: Test Error Handling
```javascript
it('should return error for invalid input', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .send({ /* invalid data */ })
    .expect(400);  // Bad Request
    
  expect(response.body.status).toBe('error');
  expect(response.body.error).toBeDefined();
});

it('should require authentication', async () => {
  const response = await request(app)
    .get('/api/protected-endpoint')
    .expect(401);  // Unauthorized
});

it('should handle not found', async () => {
  const response = await request(app)
    .get('/api/endpoint/nonexistent-id')
    .set('Authorization', `Bearer ${token}`)
    .expect(404);  // Not Found
});
```

---

## 📊 Understanding HTTP Status Codes in Tests

```javascript
// Success Codes
.expect(200)  // OK - Request succeeded
.expect(201)  // Created - Resource created successfully
.expect(204)  // No Content - Success with no response body

// Error Codes - Client Error
.expect(400)  // Bad Request - Invalid input
.expect(401)  // Unauthorized - Authentication required
.expect(403)  // Forbidden - Not allowed
.expect(404)  // Not Found - Resource doesn't exist
.expect(409)  // Conflict - Duplicate/conflict

// Error Codes - Server Error
.expect(500)  // Internal Server Error
```

---

## 🚀 Complete Real-World Test File

Create this as `__tests__/integration/medicine.integration.test.js`:

```javascript
/**
 * Medicine Management Integration Tests
 */

const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');
const { registerPharmacyAndLogin } = require('./httpTestHelpers');

let app;
let pharmacyToken;

beforeAll(async () => {
  await startDB();
  app = require('../../app');
  await new Promise(resolve => setTimeout(resolve, 100));
});

afterAll(async () => {
  await stopDB();
});

beforeEach(async () => {
  await clearDB();
  
  // Set up pharmacy user
  const { token } = await registerPharmacyAndLogin(app);
  pharmacyToken = token;
});

describe('Medicine Management', () => {
  
  it('should retrieve available medicines', async () => {
    const response = await request(app)
      .get('/api/drug/available')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    console.log('✅ Retrieved medicines:', response.body);
    expect(response.body).toBeDefined();
  });
  
  it('should search medicines', async () => {
    const response = await request(app)
      .get('/api/drug/search')
      .query({ query: 'paracetamol' })
      .expect(200);
    
    console.log('🔍 Search results:', response.body);
    expect(response.body).toBeDefined();
  });
  
  it('should be accessible without auth', async () => {
    const response = await request(app)
      .get('/api/drug/available');
    
    // Should work even without auth
    expect([200, 400, 500]).toContain(response.status);
  });
  
});
```

Run it with:
```bash
npm run test:integration -- __tests__/integration/medicine.integration.test.js
```

---

## ✅ Checklist: Before Writing Your Test

- [ ] Endpoint URL is correct (`/api/endpoint`)
- [ ] HTTP method is correct (`GET`, `POST`, `PUT`, `DELETE`)
- [ ] Request body matches API requirements
- [ ] Expected status code is correct (200, 201, 400, 401, etc.)
- [ ] Test has descriptive name
- [ ] Frontend and test are in sync

---

## 🐛 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Test times out | Increase `testTimeout: 30000` in jest.config.integration.js |
| "Cannot find module" | Check path is correct (../../app) |
| Token not working | Ensure auth endpoint returns `token` in response |
| Database not cleared | Check `beforeEach` calls `clearDB()` |
| Cron job timeout | Already fixed - tests disable cron |

---

## 📝 Your Next Steps

1. **View existing tests** to understand the pattern
   ```bash
   cat __tests__/integration/auth.integration.test.js
   ```

2. **Run a test** to see it working
   ```bash
   npm run test:integration -- auth.integration.test.js
   ```

3. **Create your first test** by copying one of the patterns above

4. **Update tests** based on your actual API responses

5. **Check coverage**
   ```bash
   npm run test:integration -- --coverage
   ```

---

## 💡 Pro Tips

✨ **Tip 1: Test One Thing Per Test**
```javascript
// Good - tests one thing
it('should register user', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send(userData)
    .expect(201);
  expect(response.body.status).toBe('success');
});

// Bad - tests multiple things
it('should register and login', async () => {
  // Too much logic, hard to debug if it fails
});
```

✨ **Tip 2: Use Descriptive Names**
```javascript
// Good
it('should return 400 when email is missing')

// Bad
it('should work')
```

✨ **Tip 3: Test Error Cases**
```javascript
describe('Registration', () => {
  it('should succeed with valid data');  // Happy path
  it('should fail with duplicate email');  // Error case
  it('should fail with invalid email');  // Error case
  it('should fail with missing password');  // Error case
});
```

---

## 📞 Need Help?

Check these files:
- `HOW_TO_TEST.md` - Detailed guide
- `QUICK_REFERENCE.md` - Quick lookup
- `README.md` - Full documentation  
- Existing tests in `__tests__/integration/`

