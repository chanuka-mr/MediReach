/**
 * Authentication Integration Tests - CORRECTED
 * 
 * IMPORTANT: Your API returns FLAT response structure:
 *   { _id, name, email, contactNumber, addresses, role, token }
 * 
 * NOT nested in .data:
 *   { status: 'success', data: { ... } }
 */

const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestUser } = require('./testUtils');

let app;

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

describe('✅ Authentication - Registration & Login (CORRECTED)', () => {
  
  // ──────────────── REGISTRATION TESTS ────────────────
  
  it('should register a new user', async () => {
    const userData = createTestUser();
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(res.status).toBe(201);
    expect(res.body._id).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe(userData.email);
    expect(res.body.name).toBe(userData.name);
  });

  it('should fail registration with duplicate email', async () => {
    const userData = createTestUser();
    
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Second registration with same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(res.status).not.toBe(201);
    expect([400, 409, 500]).toContain(res.status);
  });

  it('should fail registration with invalid email', async () => {
    const userData = createTestUser();
    userData.email = 'not-an-email';
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect([400, 422]).toContain(res.status);
  });

  it('should fail registration with missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' }); // Missing password
    
    expect([400, 422]).toContain(res.status);
  });

  // ──────────────── LOGIN TESTS ────────────────
  
  it('should login with valid credentials', async () => {
    const userData = createTestUser();
    
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.email).toBe(userData.email);
  });

  it('should fail login with wrong password', async () => {
    const userData = createTestUser();
    
    // Register
    await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Login with wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: 'wrongpassword'
      });
    
    expect([400, 401, 404]).toContain(res.status);
  });

  it('should fail login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'anypassword'
      });
    
    expect([400, 401, 404]).toContain(res.status);
  });

  // ──────────────── TOKEN TESTS ────────────────
  
  it('should return valid JWT token', async () => {
    const userData = createTestUser();
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    const token = res.body.token;
    expect(token).toBeTruthy();
    
    // JWT structure: header.payload.signature
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  // ──────────────── USER DATA TESTS ────────────────
  
  it('should not return password in response', async () => {
    const userData = createTestUser();
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    expect(res.body.password).toBeUndefined();
    expect(res.body.hashedPassword).toBeUndefined();
  });

});
