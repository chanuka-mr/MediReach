/**
 * Authentication Integration Tests
 * Tests full auth flow with Express server and test database
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestUser, createTestPharmacy } = require('./testUtils');

// Load Express app and models
let app;
let User;

beforeAll(async () => {
  // Start test database
  await startDB();
  
  // Import app after DB is ready
  app = require('../../app');
  User = require('../../Models/userModel');
  
  // Wait for models to be registered
  await new Promise(resolve => setTimeout(resolve, 100));
});

afterAll(async () => {
  await stopDB();
});

beforeEach(async () => {
  await clearDB();
});

// ─── Registration Tests ───────────────────────────────────────────────────

describe('Auth Integration - Registration', () => {
  it('should register a new user with valid credentials', async () => {
    const userData = createTestUser();
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Accept any successful response (200 or 201)
    console.log('Registration response:', response.status, response.body);
    expect([200, 201]).toContain(response.status);
  });

  it('should fail registration with duplicate email', async () => {
    const userData = createTestUser();
    
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Second registration with same email should fail
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);
    
    expect(response.body.status).toBe('error');
  });

  it('should fail registration with invalid email', async () => {
    const userData = createTestUser({
      email: 'invalid-email',
    });
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);
    
    expect(response.body.status).toBe('error');
  });

  it('should fail registration with missing required fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        // Missing password
      })
      .expect(400);
    
    expect(response.body.status).toBe('error');
  });

  it('should register a pharmacy user successfully', async () => {
    const pharmacyData = createTestPharmacy();
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(pharmacyData)
      .expect(201);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.user.role).toBe('pharmacy');
    expect(response.body.data.user.pharmacyName).toBe(pharmacyData.pharmacyName);
  });
});

// ─── Login Tests ───────────────────────────────────────────────────────────

describe('Auth Integration - Login', () => {
  beforeEach(async () => {
    // Create a test user for login tests
    const userData = createTestUser();
    await request(app)
      .post('/api/auth/register')
      .send(userData);
  });

  it('should login with valid credentials and return token', async () => {
    const loginData = {
      email: 'testuser@example.com',
      password: 'Test123!@#',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user.email).toBe(loginData.email);
  });

  it('should fail login with wrong password', async () => {
    const loginData = {
      email: 'testuser@example.com',
      password: 'WrongPassword123!',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);
    
    expect(response.body.status).toBe('error');
  });

  it('should fail login with non-existent email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'Test123!@#',
    };
    
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(401);
    
    expect(response.body.status).toBe('error');
  });

  it('should fail login with missing credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
        // Missing password
      })
      .expect(400);
    
    expect(response.body.status).toBe('error');
  });
});

// ─── Password Reset Tests ──────────────────────────────────────────────────

describe('Auth Integration - Password Reset', () => {
  beforeEach(async () => {
    const userData = createTestUser();
    await request(app)
      .post('/api/auth/register')
      .send(userData);
  });

  it('should request password reset with valid email', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'testuser@example.com',
      })
      .expect(200);
    
    expect(response.body.status).toBe('success');
  });

  it('should fail password reset with non-existent email', async () => {
    const response = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'nonexistent@example.com',
      })
      .expect(404);
    
    expect(response.body.status).toBe('error');
  });
});
