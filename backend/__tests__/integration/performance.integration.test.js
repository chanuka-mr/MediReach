/**
 * Performance Integration Tests
 * Measures response times and database query performance
 */

const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestUser, createTestPharmacy, createTestInquiry } = require('./testUtils');

let app;
let authToken;
let pharmacyToken;
let testUserEmail = 'perf@test.com';
let testUserPassword = 'Test@1234';

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

  // Create test user
  const userData = createTestUser({
    email: testUserEmail,
  });
  testUserPassword = userData.password;
  const userRes = await request(app)
    .post('/api/auth/register')
    .send(userData);
  authToken = userRes.body.token;

  // Create test pharmacy
  const pharmacyData = createTestPharmacy({
    email: 'pharmacy@perf.test',
  });
  const pharmacyRes = await request(app)
    .post('/api/auth/register')
    .send(pharmacyData);
  pharmacyToken = pharmacyRes.body.token;
});

describe('⚡ Performance Tests', () => {

  describe('Response Time Benchmarks', () => {
    
    it('should register user in < 500ms', async () => {
      const startTime = performance.now();
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(createTestUser({
          email: `perf-${Date.now()}@test.com`,
        }));
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Registration time: ${duration.toFixed(2)}ms`);
      expect(res.status).toBe(201);
      expect(duration).toBeLessThan(500);
    });

    it('should login in < 300ms', async () => {
      const startTime = performance.now();
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
        });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Login time: ${duration.toFixed(2)}ms`);
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(300);
    });

    it('should retrieve user profile in < 200ms', async () => {
      const startTime = performance.now();
      
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Get profile time: ${duration.toFixed(2)}ms`);
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(200);
    });

    it('should list pharmacies in < 400ms', async () => {
      // Create some pharmacies
      for (let i = 0; i < 5; i++) {
        await clearDB();
        await request(app)
          .post('/api/auth/register')
          .send(createTestPharmacy({
            email: `pharm-${i}@test.com`,
            pharmacyName: `Pharmacy ${i}`,
          }));
      }

      const startTime = performance.now();
      
      const res = await request(app)
        .get('/api/pharmacies')
        .query({ page: 1, limit: 10 });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  List pharmacies time: ${duration.toFixed(2)}ms`);
      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(400);
    });

    it('should create inquiry in < 300ms', async () => {
      const startTime = performance.now();
      
      const res = await request(app)
        .post('/api/inquiries')
        .send(createTestInquiry({
          email: `inquiry-${Date.now()}@test.com`,
        }));
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Create inquiry time: ${duration.toFixed(2)}ms`);
      expect(res.status).toBe(201);
      expect(duration).toBeLessThan(300);
    });
  });

  describe('Concurrent Request Performance', () => {
    
    it('should handle 10 concurrent login requests', async () => {
      const startTime = performance.now();
      
      // Create 10 test users
      const users = [];
      for (let i = 0; i < 10; i++) {
        const userData = createTestUser({
          email: `concurrent-${i}@test.com`,
        });
        const res = await request(app)
          .post('/api/auth/register')
          .send(userData);
        users.push({
          email: userData.email,
          password: userData.password,
        });
      }

      // Make 10 concurrent login requests
      const promises = users.map(user =>
        request(app)
          .post('/api/auth/login')
          .send(user)
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  10 concurrent logins: ${duration.toFixed(2)}ms (avg ${(duration / 10).toFixed(2)}ms per request)`);
      expect(results.every(r => r.status === 200)).toBe(true);
      expect(duration).toBeLessThan(3000); // All 10 should complete in < 3 seconds
    });

    it('should handle 5 concurrent inquiry creations', async () => {
      const startTime = performance.now();
      
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/inquiries')
            .send(createTestInquiry({
              email: `concurrent-inquiry-${i}@test.com`,
            }))
        );
      }

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  5 concurrent inquiries: ${duration.toFixed(2)}ms (avg ${(duration / 5).toFixed(2)}ms per request)`);
      expect(results.every(r => r.status === 201)).toBe(true);
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Database Query Performance', () => {
    
    it('should retrieve single user quickly', async () => {
      const startTime = performance.now();
      
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Single user query: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(150);
    });

    it('should search pharmacies by location efficiently', async () => {
      // Create some pharmacies with location data
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/auth/register')
          .send(createTestPharmacy({
            email: `location-${i}@test.com`,
          }));
      }

      const startTime = performance.now();
      
      const res = await request(app)
        .get('/api/pharmacies/nearby')
        .query({
          lat: 6.9271,
          lng: 80.7789,
          radius: 5,
        });
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Location-based search: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(300);
    });
  });

  describe('Memory Usage', () => {
    
    it('should not leak memory on repeated operations', async () => {
      const iterations = 50;
      const startMem = process.memoryUsage().heapUsed / 1024 / 1024; // In MB

      for (let i = 0; i < iterations; i++) {
        await request(app)
          .post('/api/inquiries')
          .send(createTestInquiry({
            email: `memory-${i}@test.com`,
          }));
      }

      const endMem = process.memoryUsage().heapUsed / 1024 / 1024; // In MB
      const memIncrease = endMem - startMem;

      console.log(`  Memory after ${iterations} operations: +${memIncrease.toFixed(2)}MB`);
      // Memory increase should be reasonable (< 100MB for 50 operations)
      expect(memIncrease).toBeLessThan(100);
    });
  });

  describe('Payload Size Impact', () => {
    
    it('should handle large update payloads efficiently', async () => {
      const largeData = {
        name: 'Updated User',
        contactNumber: '+94719999999',
        gender: 'male',
        dateOfBirth: '1990-01-01',
        addresses: Array(20).fill({
          street: 'Long Street Name That Takes Up Space',
          city: 'City Name',
          postalCode: '12345',
          isDefault: false,
        }),
      };

      const startTime = performance.now();
      
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeData);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      console.log(`  Large payload update: ${duration.toFixed(2)}ms`);
      expect([200, 204]).toContain(res.status);
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Endpoint Load Testing', () => {
    
    it('should maintain consistent performance over multiple requests', async () => {
      const iterations = 20;
      const durations = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        await request(app)
          .post('/api/inquiries')
          .send(createTestInquiry({
            email: `load-${i}@test.com`,
          }));
        
        const endTime = performance.now();
        durations.push(endTime - startTime);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);

      console.log(`  ${iterations} requests - Avg: ${avgDuration.toFixed(2)}ms, Min: ${minDuration.toFixed(2)}ms, Max: ${maxDuration.toFixed(2)}ms`);
      
      // Average should be consistent
      expect(avgDuration).toBeLessThan(250);
      // No single request should take too long
      expect(maxDuration).toBeLessThan(500);
    });
  });
});
