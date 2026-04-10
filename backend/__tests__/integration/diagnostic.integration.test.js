/**
 * Diagnostic Test - Discover Your Actual API
 * This test will show you exactly what your API returns
 * without making strict assertions
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

describe('📊 API Diagnostic - Discover What Your API Actually Returns', () => {
  
  it('should show registration response format', async () => {
    const userData = createTestUser();
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    console.log('\n🔍 REGISTRATION RESPONSE:');
    console.log('  Status:', response.status);
    console.log('  Headers:', response.headers['content-type']);
    console.log('  Body:', JSON.stringify(response.body, null, 2));
    console.log('  Error:', response.error?.text || 'None');
  });

  it('should show login endpoint available', async () => {
    const userData = createTestUser();
    
    // Register first
    await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    // Try to login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    
    console.log('\n🔍 LOGIN RESPONSE:');
    console.log('  Status:', response.status);
    console.log('  Body:', JSON.stringify(response.body, null, 2));
  });

  it('should list available endpoints', async () => {
    // Try some common endpoints
    const endpoints = [
      { method: 'get', path: '/api/auth/profile' },
      { method: 'get', path: '/api/user/profile' },
      { method: 'get', path: '/api/pharmacy/profile' },
      { method: 'get', path: '/api/inquiry/all' },
      { method: 'get', path: '/api/roms/pharmacy-tasks' },
      { method: 'post', path: '/api/inquiry/create' },
    ];

    console.log('\n🔍 ENDPOINT AVAILABILITY:');
    
    for (const endpoint of endpoints) {
      const response = await request(app)[endpoint.method](endpoint.path);
      
      const status = response.status;
      const icon = status === 404 ? '❌' : status === 401 ? '🔒' : '✅';
      
      console.log(`  ${icon} ${endpoint.method.toUpperCase()} ${endpoint.path} → ${status}`);
    }
  });

  it('should show user model structure', async () => {
    const userData = createTestUser();
    
    // Register user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    if (registerRes.status === 201 || registerRes.status === 200) {
      console.log('\n🔍 REGISTERED USER STRUCTURE:');
      console.log('  ', JSON.stringify(registerRes.body, null, 2));
    }
  });

  it('should test all test endpoints', async () => {
    const userData = createTestUser();
    
    console.log('\n🔍 TESTING ALL ENDPOINTS:');
    
    // 1. Register
    console.log('  1. POST /api/auth/register');
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(userData);
    console.log('     Status:', regRes.status);
    
    // 2. Login
    console.log('  2. POST /api/auth/login');
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });
    console.log('     Status:', loginRes.status);
    console.log('     Has token?', !!loginRes.body?.data?.token);
    
    // 3. Get profile
    if (loginRes.body?.data?.token) {
      const token = loginRes.body.data.token;
      console.log('  3. GET /api/auth/profile');
      const profileRes = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      console.log('     Status:', profileRes.status);
    }
  });

});
