# Integration Testing Guide

## Overview

This guide covers the integration tests for MediReach backend system. Integration tests verify that different components of the system work together correctly with a real database connection.

## What's Included

- **Test Database**: MongoDB Memory Server (in-memory database for testing)
- **Test Utilities**: Helper functions for creating test data
- **Auth Tests**: User registration, login, password reset flows
- **Order Tests**: Medication requests, pharmacy processing, cancellations
- **Supertest**: HTTP request library for testing Express endpoints

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Run Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run all tests (unit + integration)
npm run test:all

# Run with coverage
npm run test:coverage

# Run performance tests only
npm run test:integration -- performance.integration.test.js

# Run performance tests with verbose output
npm run test:integration -- performance.integration.test.js --verbose
```

### 3. Separate Unit Tests

```bash
# Run only unit tests (excludes integration)
npm test
```

## Test Structure

```
__tests__/
├── integration/
│   ├── setup.js                      # Database setup/teardown
│   ├── testUtils.js                  # Test data factories
│   ├── auth.corrected.integration.test.js      # Auth flow tests
│   ├── orders.corrected.integration.test.js    # Orders/ROMS flow tests
│   ├── pharmacy.corrected.integration.test.js  # Pharmacy flow tests
│   ├── performance.integration.test.js         # Performance benchmarks
│   ├── README.md                     # This file
│   └── PERFORMANCE_TESTING.md        # Performance testing guide
├── controllers/                      # Unit tests for controllers
└── setup.js                          # Unit test setup
```

## Database Setup

The integration tests use `mongodb-memory-server` which provides an in-memory MongoDB instance:

```javascript
// Automatically handled in setup.js
const { startDB, stopDB, clearDB } = require('./setup');

beforeAll(async () => {
  await startDB();  // Start in-memory MongoDB
});

afterAll(async () => {
  await stopDB();   // Stop in-memory MongoDB
});

beforeEach(async () => {
  await clearDB();  // Clear all collections before each test
});
```

## Creating Test Data

Use the factory functions in `testUtils.js`:

```javascript
import { createTestUser, createTestPharmacy, createTestInquiry } from './testUtils';

// Create a regular user
const user = createTestUser({
  name: 'Custom Name',
  email: 'custom@example.com'
});

// Create a pharmacy user
const pharmacy = createTestPharmacy({
  pharmacyName: 'My Pharmacy',
  licenseNumber: 'LIC123'
});

// Create an inquiry
const inquiry = createTestInquiry({
  subject: 'Custom Subject'
});
```

## Writing Integration Tests

### Basic Structure

```javascript
import request from 'supertest';
import { startDB, stopDB, clearDB } from './setup';
import { createTestUser } from './testUtils';

let app;
let authToken;

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
});

describe('Feature Name', () => {
  it('should do something', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'value' })
      .expect(200);
    
    expect(response.body.status).toBe('success');
  });
});
```

### Testing with Authentication

```javascript
describe('Protected Endpoints', () => {
  let token;

  beforeEach(async () => {
    const user = createTestUser();
    
    // Register user
    await request(app)
      .post('/api/auth/register')
      .send(user);
    
    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: user.password
      });
    
    token = loginResponse.body.data.token;
  });

  it('should access protected endpoint with token', async () => {
    const response = await request(app)
      .get('/api/protected-route')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
  });
});
```

## Common Patterns

### Testing POST Endpoint

```javascript
it('should create a resource', async () => {
  const data = { name: 'Resource', value: 100 };
  
  const response = await request(app)
    .post('/api/resource')
    .set('Authorization', `Bearer ${authToken}`)
    .send(data)
    .expect(201);
  
  expect(response.body.status).toBe('success');
  expect(response.body.data.resource._id).toBeDefined();
});
```

### Testing GET Endpoint

```javascript
it('should retrieve resources', async () => {
  const response = await request(app)
    .get('/api/resources')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  expect(Array.isArray(response.body.data)).toBe(true);
});
```

### Testing PUT Endpoint

```javascript
it('should update a resource', async () => {
  const resourceId = 'some-id';
  
  const response = await request(app)
    .put(`/api/resource/${resourceId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'Updated Name' })
    .expect(200);
  
  expect(response.body.data.resource.name).toBe('Updated Name');
});
```

### Testing DELETE Endpoint

```javascript
it('should delete a resource', async () => {
  const resourceId = 'some-id';
  
  const response = await request(app)
    .delete(`/api/resource/${resourceId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  expect(response.body.status).toBe('success');
});
```

### Testing Error Scenarios

```javascript
it('should handle validation errors', async () => {
  const response = await request(app)
    .post('/api/resource')
    .send({ invalid: 'data' })
    .expect(400);
  
  expect(response.body.status).toBe('error');
  expect(response.body.error).toBeDefined();
});

it('should handle authentication errors', async () => {
  const response = await request(app)
    .get('/api/protected-route')
    .expect(401);
  
  expect(response.body.status).toBe('error');
});

it('should handle not found', async () => {
  const response = await request(app)
    .get('/api/resource/nonexistent-id')
    .set('Authorization', `Bearer ${authToken}`)
    .expect(404);
  
  expect(response.body.status).toBe('error');
});
```

## Expanding Tests

### Adding New Test Files

Create a new file in `__tests__/integration/`:

```javascript
// pharmacy.integration.test.js
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

describe('Pharmacy Integration Tests', () => {
  // Add your tests here
});
```

### Adding New Test Factories

Update `testUtils.js` with new factory functions:

```javascript
const createTestReport = (overrides = {}) => {
  return {
    title: 'Test Report',
    type: 'sales',
    period: 'monthly',
    ...overrides,
  };
};

module.exports = {
  // ... existing exports
  createTestReport,
};
```

## Test Execution Flow

1. **Setup Phase** (`beforeAll`)
   - Start in-memory MongoDB
   - Connect Mongoose
   - Initialize Express app
   - Register all models

2. **Test Setup** (`beforeEach`)
   - Clear all database collections
   - Set up test data
   - Authenticate test users

3. **Test Execution**
   - Make HTTP requests via supertest
   - Assert responses

4. **Cleanup** (`afterEach`)
   - Typically automatic via `clearDB()`

5. **Teardown** (`afterAll`)
   - Disconnect Mongoose
   - Stop in-memory MongoDB

## Debugging Tests

### Verbose Output

```bash
npm run test:integration -- --verbose
```

### Run Single Test File

```bash
npx jest --config jest.config.integration.js __tests__/integration/auth.integration.test.js
```

### Run Single Test Suite

```bash
npx jest --config jest.config.integration.js --testNamePattern="Auth Integration - Login"
```

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/jest --config jest.config.integration.js --runInBand
```

## Best Practices

1. **Use `beforeEach` for Setup**
   - Set up test data before each test
   - Ensures tests are isolated

2. **Use Factory Functions**
   - Keep test data uniform and maintainable
   - Easy to override for specific tests

3. **Test Edge Cases**
   - Invalid input
   - Missing authentication
   - Non-existent resources
   - Duplicate records

4. **Keep Tests Focused**
   - Each test should verify one behavior
   - Use descriptive test names

5. **Mock External Services**
   - For email, payment, file upload services
   - Use Jest mocks

6. **Test Full Workflows**
   - Register → Login → Action → Verify
   - Simulate real user behavior

## Common Issues

### Database Connection Timeout

**Problem**: Tests timeout on first run
**Solution**: First run downloads MongoDB binary (~150MB). Subsequent runs are faster.

```javascript
// Increase timeout for first run
jest.setTimeout(60000);
```

### Models Not Loading

**Problem**: Mongoose models are not registered
**Solution**: Add delay after app import

```javascript
app = require('../../app');
await new Promise(resolve => setTimeout(resolve, 100)); // Wait for models
```

### JWT Token Errors

**Problem**: JWT token creation fails
**Solution**: Ensure `JWT_SECRET` is set in `.env`

```bash
JWT_SECRET=your-secret-key
```

### Port Already in Use

**Problem**: Express server already running on test port
**Solution**: Kill previous process or use different port in tests

## Performance Testing

Performance tests measure response times, concurrency handling, database efficiency, and detect memory leaks.

### Quick Start

```bash
# Run performance tests
npm run test:performance
npm run test:performance:verbose

# Check performance summary
npm run perf:check

# Run with detailed output
npm run perf:verbose

# View help
node check-performance.js --help
```

### How to Check Performance - 5 Ways

#### 1️⃣ Run All Performance Tests
```bash
npm run test:performance
npm run test:performance:verbose
```

Shows all 12 performance tests with timing results.

#### 2️⃣ Run Specific Test Category
```bash
# Response Time Tests
npm run test:integration -- performance.integration.test.js --testNamePattern="Response Time"

# Concurrency Tests
npm run test:integration -- performance.integration.test.js --testNamePattern="Concurrent"

# Database Tests
npm run test:integration -- performance.integration.test.js --testNamePattern="Database"

# Memory Tests
npm run test:integration -- performance.integration.test.js --testNamePattern="Memory"

# Load Tests
npm run test:integration -- performance.integration.test.js --testNamePattern="Load"
```

#### 3️⃣ View Performance Summary
```bash
npm run perf:check
```

Displays a formatted summary of all performance metrics and status.

#### 4️⃣ View Performance Guide
```bash
cat __tests__/integration/PERFORMANCE_TESTING.md
```

Comprehensive guide with best practices, profiling, optimization tips.

#### 5️⃣ View Test File
```bash
cat __tests__/integration/performance.integration.test.js
```

See actual test code and metrics being measured.

### Expected Results

| Test | Threshold | Typical Time | Status |
|------|-----------|--------------|--------|
| Register | < 500ms | ~400-450ms | ✅ |
| Login | < 300ms | ~300-350ms | ✅ |
| Get Profile | < 200ms | ~240ms | ✅ |
| List Pharmacies | < 400ms | ~800ms | ⚠️ (DB dependent) |
| Create Inquiry | < 300ms | ~200-300ms | ✅ |
| 10x Concurrent Logins | < 3000ms | ~2000-2100ms | ✅ |
| 5x Concurrent Creates | < 2000ms | ~250-300ms | ✅ |
| Single Query | < 150ms | ~235ms | ⚠️ |
| Search | < 300ms | ~500-600ms | ⚠️ |
| Memory (50 ops) | < 100MB | Varies | ✅ |
| Large Payload | < 500ms | ~250ms | ✅ |
| Load Consistency | Stable | Monitored | ✅ |

### What's Tested

**Response Time Benchmarks** ⏱️
- Auth operations (register, login)
- Profile operations (get, update)
- Create operations
- List operations

**Concurrency** 🔄
- 10 concurrent logins
- 5 concurrent creations

**Database** 🗄️
- Single record queries
- Location-based searches

**Memory** 💾
- No leaks over 50 operations
- Heap monitoring

**Load** 📊
- Consistency over 20 requests
- Performance stability

### Reading Output

Example:
```
✓ should register user in < 500ms (404 ms)
```

- ✓ = Test passed
- < 500ms = SLA (Service Level Agreement) target
- (404 ms) = Actual time taken

### Green Flags ✅
- All tests passing
- Response times within thresholds
- No memory leaks
- Consistent performance

### Red Flags ⚠️
- Tests exceeding thresholds by > 20%
- Times increasing over iterations
- Memory growing linearly
- Large variance (> 100ms spread)

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| First test slow | MongoDB binary downloads | Normal, subsequent runs faster |
| List operations slow | Missing database indexes | Add indexes on query fields |
| Memory increasing | Circular references | Ensure cleanup in tests |
| Concurrent tests fail | Low connection pool | Increase pool size in config |
| Variable response times | System load/GC | Run tests in isolation |

### npm Scripts Added

```json
"test:performance": "Performance tests only",
"test:performance:verbose": "With detailed output",
"perf:check": "Show performance summary",
"perf:verbose": "Verbose output",
"perf:json": "JSON report (not working on Windows)",
"perf:csv": "CSV report (not working on Windows)",
"perf:baseline": "Save baseline for comparison",
"perf:compare": "Compare to baseline",
"perf:monitor": "Live monitoring (experimental)"
```

## Performance Considerations

- **In-memory MongoDB**: Fast for isolated tests
- **No file uploads**: Skip Cloudinary tests or mock them
- **Batch Tests**: Run with `--runInBand` for serial execution
- **Parallel Tests**: Use default parallel for faster execution

```bash
# Serial (slower but safer)
npm run test:integration

# Parallel (faster)
npx jest --config jest.config.integration.js
```

## Next Steps

1. **Add more test scenarios** for edge cases
2. **Mock external services** (email, payments, file uploads)
3. **Add performance benchmarks** for critical endpoints
4. **Set up CI/CD** to run tests automatically
5. **Increase code coverage** to 80%+ for critical paths

## Useful Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/typegoose/mongodb-memory-server)
- [Mongoose Testing Guide](https://mongoosejs.com/docs/jest.html)
