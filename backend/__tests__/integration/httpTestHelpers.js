/**
 * HTTP Test Helpers
 * Common functions for making HTTP requests in integration tests
 */

const request = require('supertest');

/**
 * Helper to make authenticated requests
 */
class AuthenticatedRequest {
  constructor(app, token = null) {
    this.app = app;
    this.token = token;
  }

  /**
   * Set authentication token
   */
  setToken(token) {
    this.token = token;
    return this;
  }

  /**
   * Make GET request
   */
  get(path) {
    const req = request(this.app).get(path);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  /**
   * Make POST request
   */
  post(path, data = {}) {
    const req = request(this.app).post(path).send(data);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  /**
   * Make PUT request
   */
  put(path, data = {}) {
    const req = request(this.app).put(path).send(data);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  /**
   * Make DELETE request
   */
  delete(path) {
    const req = request(this.app).delete(path);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }

  /**
   * Make PATCH request
   */
  patch(path, data = {}) {
    const req = request(this.app).patch(path).send(data);
    if (this.token) {
      req.set('Authorization', `Bearer ${this.token}`);
    }
    return req;
  }
}

/**
 * Register a test user and get auth token
 */
const registerAndLogin = async (app, userData = {}) => {
  const { createTestUser } = require('./testUtils');
  const user = createTestUser(userData);

  // Register
  await request(app)
    .post('/api/auth/register')
    .send(user);

  // Login
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: user.password,
    });

  const token = loginResponse.body.data?.token;
  return { user, token };
};

/**
 * Register pharmacy user and get auth token
 */
const registerPharmacyAndLogin = async (app, pharmacyData = {}) => {
  const { createTestPharmacy } = require('./testUtils');
  const pharmacy = createTestPharmacy(pharmacyData);

  // Register
  await request(app)
    .post('/api/auth/register')
    .send(pharmacy);

  // Login
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: pharmacy.email,
      password: pharmacy.password,
    });

  const token = loginResponse.body.data?.token;
  return { pharmacy, token };
};

/**
 * Test successful resource creation
 */
const testCreate = async (
  app,
  method,
  path,
  data,
  expectedStatus = 201,
  token = null
) => {
  const req = request(app)[method](path).send(data);
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  const response = await req.expect(expectedStatus);
  return response.body;
};

/**
 * Test successful resource retrieval
 */
const testGet = async (app, path, token = null, expectedStatus = 200) => {
  const req = request(app).get(path);
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  const response = await req.expect(expectedStatus);
  return response.body;
};

/**
 * Test successful resource update
 */
const testUpdate = async (
  app,
  method,
  path,
  data,
  token = null,
  expectedStatus = 200
) => {
  const req = request(app)[method](path).send(data);
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  const response = await req.expect(expectedStatus);
  return response.body;
};

/**
 * Test successful resource deletion
 */
const testDelete = async (
  app,
  path,
  token = null,
  expectedStatus = 200
) => {
  const req = request(app).delete(path);
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  const response = await req.expect(expectedStatus);
  return response.body;
};

/**
 * Test error response
 */
const testError = async (
  app,
  method,
  path,
  data = {},
  expectedStatus = 400,
  token = null
) => {
  const req = request(app)[method](path);
  
  if (Object.keys(data).length > 0) {
    req.send(data);
  }
  
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  const response = await req.expect(expectedStatus);
  expect(response.body.status).toBe('error');
  return response.body;
};

/**
 * Assert standard success response structure
 */
const assertSuccessResponse = (body, hasData = true) => {
  expect(body.status).toBe('success');
  if (hasData) {
    expect(body.data).toBeDefined();
  }
};

/**
 * Assert standard error response structure
 */
const assertErrorResponse = (body) => {
  expect(body.status).toBe('error');
  expect(body.error || body.message).toBeDefined();
};

/**
 * Assert resource has expected fields
 */
const assertResourceFields = (resource, fields) => {
  fields.forEach(field => {
    expect(resource).toHaveProperty(field);
  });
};

/**
 * Wait for async operations
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generate random string for unique test data
 */
const randomString = (length = 10) => {
  return Math.random().toString(36).substring(2, length + 2);
};

/**
 * Generate unique email
 */
const uniqueEmail = (prefix = 'test') => {
  return `${prefix}-${randomString(8)}@example.com`;
};

/**
 * Pagination test helper
 */
const testPagination = async (app, path, token = null) => {
  // Test first page
  const page1 = await testGet(app, `${path}?page=1&limit=10`, token);
  expect(Array.isArray(page1.data) || page1.data).toBeDefined();

  // Test second page
  const page2 = await testGet(app, `${path}?page=2&limit=10`, token);
  expect(Array.isArray(page2.data) || page2.data).toBeDefined();
};

/**
 * Search test helper
 */
const testSearch = async (app, path, searchTerm, token = null) => {
  const response = await testGet(
    app,
    `${path}?search=${encodeURIComponent(searchTerm)}`,
    token
  );
  return response.data;
};

/**
 * Date range filter test helper
 */
const testDateRangeFilter = async (app, path, startDate, endDate, token = null) => {
  const response = await testGet(
    app,
    `${path}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
    token
  );
  return response.data;
};

module.exports = {
  AuthenticatedRequest,
  registerAndLogin,
  registerPharmacyAndLogin,
  testCreate,
  testGet,
  testUpdate,
  testDelete,
  testError,
  assertSuccessResponse,
  assertErrorResponse,
  assertResourceFields,
  delay,
  randomString,
  uniqueEmail,
  testPagination,
  testSearch,
  testDateRangeFilter,
};
