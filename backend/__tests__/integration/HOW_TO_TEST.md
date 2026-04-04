# 🚀 Integration Testing - Step by Step Guide

## Part 1: Running Existing Tests

### Step 1: Navigate to Backend
```bash
cd backend
```

### Step 2: Run Tests

**Option A: Run All Integration Tests**
```bash
npm run test:integration
```

**Option B: Run Only Unit Tests**
```bash
npm test
```

**Option C: Run Everything (Unit + Integration)**
```bash
npm run test:all
```

**Option D: Watch Mode (Auto-rerun on file changes)**
```bash
npm run test:integration -- --watch
```

**Option E: Show Coverage Report**
```bash
npm run test:integration -- --coverage
```

---

## Part 2: Understanding Test Output

### Successful Test Run Output
```
 PASS  __tests__/integration/auth.integration.test.js (5.234s)
  Auth Integration - Registration
    ✓ should register a new user with valid credentials (123ms)
    ✓ should fail registration with duplicate email (89ms)
    ✓ should register a pharmacy user successfully (98ms)
  Auth Integration - Login
    ✓ should login with valid credentials and return token (92ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
```

### What Each Symbol Means
- ✓ = Test passed ✅
- ✕ = Test failed ❌
- ◆ = Test skipped ⏭️

---

## Part 3: Writing Your First Test

### Step 1: Create a New Test File
Create `__tests__/integration/user.integration.test.js`:

```javascript
const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestUser } = require('./testUtils');

let app;
let authToken;

beforeAll(async () => {
  await startDB();  // Start test database
  app = require('../../app');
  await new Promise(resolve => setTimeout(resolve, 100)); // Wait for models
});

afterAll(async () => {
  await stopDB();   // Stop test database
});

beforeEach(async () => {
  await clearDB();  // Clean database before each test
  
  // Setup: Create and login a test user
  const user = createTestUser();
  await request(app)
    .post('/api/auth/register')
    .send(user);
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: user.password
    });
  
  authToken = loginRes.body.data.token;
});

// YOUR TESTS GO HERE
describe('User Management', () => {
  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.user).toBeDefined();
  });
});
```

### Step 2: Run Your New Test
```bash
npm run test:integration -- __tests__/integration/user.integration.test.js
```

### Step 3: See It Pass ✅

---

## Part 4: Common Testing Patterns

### Pattern 1: Test POST Endpoint (Create)
```javascript
it('should create a resource', async () => {
  const response = await request(app)
    .post('/api/endpoint')
    .set('Authorization', `Bearer ${authToken}`)
    .send({
      name: 'Test Resource',
      description: 'Test description'
    })
    .expect(201);  // Expect 201 (Created)
  
  expect(response.body.status).toBe('success');
  expect(response.body.data.resource._id).toBeDefined();
});
```

### Pattern 2: Test GET Endpoint (Retrieve)
```javascript
it('should retrieve resources', async () => {
  const response = await request(app)
    .get('/api/resources')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);  // Expect 200 (OK)
  
  expect(Array.isArray(response.body.data)).toBe(true);
  expect(response.body.data.length).toBeGreaterThan(0);
});
```

### Pattern 3: Test PUT Endpoint (Update)
```javascript
it('should update a resource', async () => {
  const resourceId = 'some-resource-id';
  
  const response = await request(app)
    .put(`/api/resources/${resourceId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'Updated Name' })
    .expect(200);  // Expect 200 (OK)
  
  expect(response.body.data.resource.name).toBe('Updated Name');
});
```

### Pattern 4: Test DELETE Endpoint (Delete)
```javascript
it('should delete a resource', async () => {
  const resourceId = 'some-resource-id';
  
  const response = await request(app)
    .delete(`/api/resources/${resourceId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);  // Expect 200 (OK)
  
  expect(response.body.status).toBe('success');
});
```

### Pattern 5: Test Error Handling
```javascript
it('should return error for invalid data', async () => {
  const response = await request(app)
    .post('/api/resources')
    .send({ /* invalid data */ })
    .expect(400);  // Expect 400 (Bad Request)
  
  expect(response.body.status).toBe('error');
  expect(response.body.error).toBeDefined();
});
```

### Pattern 6: Test Authentication Required
```javascript
it('should fail without authentication', async () => {
  const response = await request(app)
    .get('/api/protected-endpoint')
    .expect(401);  // Expect 401 (Unauthorized)
  
  expect(response.body.status).toBe('error');
});
```

### Pattern 7: Test with Query Parameters
```javascript
it('should search with query parameters', async () => {
  const response = await request(app)
    .get('/api/resources')
    .query({ search: 'medicine', page: 1, limit: 10 })
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  expect(response.body.data).toBeDefined();
});
```

---

## Part 5: Using Test Utilities

### Example 1: Create Custom Test User
```javascript
const { createTestUser } = require('./testUtils');

const customUser = createTestUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
});

// Now register this user
await request(app)
  .post('/api/auth/register')
  .send(customUser);
```

### Example 2: Create Test Pharmacy
```javascript
const { createTestPharmacy } = require('./testUtils');

const pharmacy = createTestPharmacy({
  pharmacyName: 'Central Pharmacy',
  licenseNumber: 'LIC-2024-001'
});

// Register pharmacy
await request(app)
  .post('/api/auth/register')
  .send(pharmacy);
```

### Example 3: Create Test Inquiry
```javascript
const { createTestInquiry } = require('./testUtils');

const inquiry = createTestInquiry({
  name: 'Patient Name',
  subject: 'Medicine availability query',
  message: 'Do you have Aspirin in stock?'
});

// Submit inquiry
await request(app)
  .post('/api/inquiry/create')
  .send(inquiry);
```

---

## Part 6: Debugging Tests

### Debug Option 1: Run Single Test Suite
```bash
npm run test:integration -- auth.integration.test.js
```

### Debug Option 2: Run Specific Test
```bash
npm run test:integration -- --testNamePattern="should register a new user"
```

### Debug Option 3: Verbose Output
```bash
npm run test:integration -- --verbose
```

### Debug Option 4: Stop on First Failure
```bash
npm run test:integration -- --bail
```

### Debug Option 5: Add Console Logs
```javascript
it('should do something', async () => {
  console.log('🔍 Starting test...');
  
  const response = await request(app)
    .post('/api/endpoint')
    .send(data);
  
  console.log('📦 Response:', response.body);
  console.log('✅ Test complete');
  
  expect(response.body.status).toBe('success');
});
```

Run with:
```bash
npm run test:integration -- --verbose
```

### Debug Option 6: Check Response Details
```javascript
it('should debug response', async () => {
  const response = await request(app)
    .get('/api/endpoint')
    .set('Authorization', `Bearer ${authToken}`);
  
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  console.log('Body:', response.body);
  console.log('Error:', response.error);
});
```

---

## Part 7: Complete Example Test

Here's a complete test file you can copy-paste and modify:

```javascript
/**
 * Medicine Management Integration Tests
 */

const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestPharmacy } = require('./testUtils');

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
  
  // Create pharmacy user
  const pharmacy = createTestPharmacy();
  await request(app)
    .post('/api/auth/register')
    .send(pharmacy);
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({
      email: pharmacy.email,
      password: pharmacy.password
    });
  
  pharmacyToken = loginRes.body.data?.token;
});

describe('Medicine Management', () => {
  
  it('should retrieve available medicines', async () => {
    const response = await request(app)
      .get('/api/drug/available')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data) || response.body.data).toBeDefined();
  });
  
  it('should search medicines by name', async () => {
    const response = await request(app)
      .get('/api/drug/search')
      .query({ query: 'paracetamol' })
      .expect(200);
    
    expect(response.body.status === 'success' || Array.isArray(response.body.data)).toBe(true);
  });
  
  it('should handle search with no results', async () => {
    const response = await request(app)
      .get('/api/drug/search')
      .query({ query: 'xyznonexistent' })
      .expect(200);
    
    // Should not error, just return empty or error message
    expect(response.body).toBeDefined();
  });
  
});
```

---

## Part 8: Test Coverage

### Check Coverage
```bash
npm run test:integration -- --coverage
```

### Coverage Report Output
```
——————————————————————————————————————
File               | % Stmts | % Branch
——————————————————————————————————————
All files         | 75.23   | 68.45
 Controllers      | 82.15   | 75.22
 Models           | 68.90   | 60.12
 Routes           | 71.33   | 69.44
——————————————————————————————————————
```

### View Detailed Report
```bash
# After running coverage, open the HTML report
open coverage/integration/index.html
```

---

## Part 9: Common Issues & Solutions

### ❌ Issue: "Cannot find module 'app.js'"
**Solution**: Ensure app.js exists and add delay after import:
```javascript
app = require('../../app');
await new Promise(resolve => setTimeout(resolve, 100));
```

### ❌ Issue: "JWT token is invalid or undefined"
**Solution**: Make sure `JWT_SECRET` is in `.env`:
```env
JWT_SECRET=your-secret-key
```

### ❌ Issue: "Test timeout (exceeded 10000ms)"
**Solution**: The test is taking too long. Increase timeout:
```javascript
jest.setTimeout(30000);  // 30 seconds
```

### ❌ Issue: "Database connection refused"
**Solution**: This should not happen with Memory Server. Try clearing node_modules:
```bash
npm install --no-save mongodb-memory-server
npm run test:integration
```

### ❌ Issue: "Expected 201 but got 400"
**Solution**: Check the response error:
```javascript
const response = await request(app).post('/api/endpoint').send(data);
console.log('Response:', response.body);  // See what went wrong
```

---

## Part 10: Quick Command Reference

```bash
# Start tests
npm run test:integration

# Watch mode (re-run on file change)
npm run test:integration -- --watch

# Run specific file
npm run test:integration -- auth.integration.test.js

# Run specific test
npm run test:integration -- --testNamePattern="should register"

# Show coverage
npm run test:integration -- --coverage

# Run only one test (useful for debugging)
npm run test:integration -- -t "should login"

# Verbose output
npm run test:integration -- --verbose

# Stop on first error
npm run test:integration -- --bail

# Run in serial mode (slower but more reliable)
npm run test:integration -- --runInBand

# List all tests without running
npm run test:integration -- --listTests
```

---

## Part 11: Before Pushing to Production

Checklist before committing:

- [ ] All integration tests pass: `npm run test:integration`
- [ ] All unit tests pass: `npm test`
- [ ] Code coverage is above 70%: `npm run test:integration -- --coverage`
- [ ] No console.log statements left in test files
- [ ] Test names are descriptive
- [ ] Tests clean up after themselves (beforeEach clears DB)
- [ ] No hardcoded IDs or email addresses in tests

---

## Resources

- 📖 [Jest Documentation](https://jestjs.io/docs/getting-started)
- 📖 [Supertest Guide](https://github.com/visionmedia/supertest)
- 📖 [MongoDB Memory Server](https://github.com/typegoose/mongodb-memory-server)
- 📋 [Full README](./README.md)
- ⚡ [Quick Reference](./QUICK_REFERENCE.md)
