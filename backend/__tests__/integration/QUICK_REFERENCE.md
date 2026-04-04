# Integration Testing Quick Reference

## File Structure

```
__tests__/integration/
├── setup.js                      # Database setup/teardown
├── testUtils.js                  # Test data factories
├── httpTestHelpers.js            # HTTP request helpers
├── auth.integration.test.js      # Auth flow tests
├── orders.integration.test.js    # Orders/ROMS tests
├── pharmacy.integration.test.js  # Pharmacy tests
├── README.md                     # Full documentation
└── run-tests.sh                  # Quick test commands
```

## Quick Commands

```bash
# Run integration tests
npm run test:integration

# Run unit tests only
npm test

# Run all tests
npm run test:all

# Watch mode
npm run test:integration -- --watch

# Coverage
npm run test:integration -- --coverage

# Specific file
npm run test:integration -- __tests__/integration/auth.integration.test.js

# With verbose output
npm run test:integration -- --verbose
```

## Basic Test Template

```javascript
const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestUser } = require('./testUtils');

let app;
let authToken;

beforeAll(async () => {
  await startDB();
  app = require('../../app');
});

afterAll(async () => {
  await stopDB();
});

beforeEach(async () => {
  await clearDB();
  
  // Set up auth
  const user = createTestUser();
  await request(app).post('/api/auth/register').send(user);
  
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  
  authToken = loginRes.body.data.token;
});

describe('Feature Name', () => {
  it('should do something', async () => {
    const response = await request(app)
      .get('/api/endpoint')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
  });
});
```

## Test Data Factories

```javascript
import { 
  createTestUser,
  createTestPharmacy,
  createTestMedicationRequest,
  createTestOrder,
  createTestInquiry
} from './testUtils';

// Create user with overrides
const user = createTestUser({ 
  name: 'Custom Name',
  email: 'custom@example.com' 
});

// Create pharmacy
const pharmacy = createTestPharmacy({
  pharmacyName: 'My Pharmacy'
});

// Create order
const order = createTestMedicationRequest({
  user_id: userId
});
```

## HTTP Helpers

```javascript
import {
  registerAndLogin,
  registerPharmacyAndLogin,
  AuthenticatedRequest,
  testCreate,
  testGet,
  testError,
  assertSuccessResponse,
  uniqueEmail
} from './httpTestHelpers';

// Register and get token
const { user, token } = await registerAndLogin(app);

// Pharmacy auth
const { pharmacy, token } = await registerPharmacyAndLogin(app);

// Authenticated request class
const authReq = new AuthenticatedRequest(app, token);
await authReq.post('/api/endpoint', { data: 'value' });
await authReq.get('/api/endpoint').expect(200);

// Create and expect success
const body = await testCreate(app, 'post', '/api/resource', 
  { name: 'Resource' }, 201, token);

// Test error
await testError(app, 'post', '/api/resource', 
  { invalidData: true }, 400);

// Unique email for tests
const email = uniqueEmail('test');
```

## Common Patterns

### Test POST with Auth
```javascript
it('should create resource', async () => {
  const response = await request(app)
    .post('/api/resource')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ name: 'Resource' })
    .expect(201);
  
  expect(response.body.status).toBe('success');
});
```

### Test GET with Query
```javascript
it('should search resources', async () => {
  const response = await request(app)
    .get('/api/resources')
    .query({ search: 'term', page: 1 })
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);
  
  expect(Array.isArray(response.body.data)).toBe(true);
});
```

### Test Error Handling
```javascript
it('should return 400 for invalid data', async () => {
  const response = await request(app)
    .post('/api/resource')
    .send({ invalid: 'data' })
    .expect(400);
  
  expect(response.body.status).toBe('error');
});
```

### Test Auth Required
```javascript
it('should fail without auth', async () => {
  const response = await request(app)
    .get('/api/protected')
    .expect(401);
  
  expect(response.body.status).toBe('error');
});
```

## Environment Variables for Tests

The tests use in-memory MongoDB, so you don't need a real database. However, ensure your `.env` has:

```env
JWT_SECRET=test-secret
MONGODB_URI=mongodb://localhost:27017/medireach-test (will be overridden by memory server)
```

## Debugging

### Run Single Test
```bash
npm run test:integration -- --testNamePattern="Auth Integration - Login"
```

### Verbose Output
```bash
npm run test:integration -- --verbose
```

### Debug in Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --config jest.config.integration.js --runInBand
```

## Performance

- **First run**: Slow (downloads MongoDB binary ~150MB)
- **Subsequent runs**: Fast (uses cached binary)
- **Single test file**: ~5-10 seconds
- **All tests**: ~30-60 seconds

## Common Issues

| Issue | Solution |
|-------|----------|
| Timeout on first run | MongoDB binary download - wait longer on first run |
| Models not loading | Add 100ms delay after `require(app)` |
| JWT errors | Ensure `JWT_SECRET` is set in `.env` |
| Port already in use | Kill other Node processes |
| Database connection fails | Check MongoDB Memory Server is installed |

## Best Practices

✅ **DO**
- Use `beforeEach` to set up fresh data
- Use factory functions for test data
- Test error cases and edge cases
- Keep tests focused and isolated
- Use descriptive test names
- Clean data between tests

❌ **DON'T**
- Hard-code test data
- Share state between tests
- Skip `beforeEach` cleanup
- Test multiple behaviors in one test
- Make real API calls to external services
- Use sleep/timeout to wait for results

## Resources

- [Jest Docs](https://jestjs.io/)
- [Supertest Docs](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/typegoose/mongodb-memory-server)
- [Full Documentation](./README.md)
