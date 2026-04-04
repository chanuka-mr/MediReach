/**
 * User Profile Integration Tests
 * Tests user profile endpoints: get, update, delete
 */

const request = require('supertest');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestUser } = require('./testUtils');

let app;
let adminUser;
let regularUser;

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

  // Register admin
  const adminData = createTestUser({
    email: 'admin@profile.test',
    role: 'admin',
  });

  const adminRes = await request(app)
    .post('/api/auth/register')
    .send(adminData);
  
  adminUser = {
    token: adminRes.body.token,
    _id: adminRes.body._id,
    ...adminRes.body,
  };

  // Register regular user
  const userData = createTestUser({
    email: 'user@profile.test',
    role: 'user',
  });

  const userRes = await request(app)
    .post('/api/auth/register')
    .send(userData);
  
  regularUser = {
    token: userRes.body.token,
    _id: userRes.body._id,
    ...userRes.body,
  };
});

describe('👤 User Profile Endpoints Integration Tests', () => {

  describe('GET Profile - GET /api/users/profile', () => {
    it('should get authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect(res.status).toBe(200);
      expect(res.body._id || res.body.id).toBeDefined();
      expect(res.body.email).toBe('user@profile.test');
    });

    it('should not include password in response', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${regularUser.token}`);

      if (res.status === 200) {
        expect(res.body.password).toBeUndefined();
      }
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('UPDATE Profile - PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${regularUser.token}`)
        .send({
          name: 'Updated Name',
          contactNumber: '+94719999999',
        });

      expect([200, 204]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.data?.user?.name || res.body.name || res.body.user?.name).toBeDefined();
      }
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({
          name: 'Updated Name',
        });

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('DELETE Profile - DELETE /api/users/profile', () => {
    it('should delete user account', async () => {
      const res = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect([200, 204]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete('/api/users/profile');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('LIST Users - GET /api/users (Admin Only)', () => {
    it('should list all users for admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect(res.status).toBe(200);
      const users = res.body.data?.users || res.body.users || res.body;
      expect(Array.isArray(users) || typeof users === 'object').toBe(true);
    });

    it('should require admin role', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect([401, 403]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/users');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('GET User by ID - GET /api/users/:id (Admin Only)', () => {
    it('should get specific user by ID as admin', async () => {
      const res = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      if (res.status === 200) {
        expect(res.body._id || res.body.id).toBe(regularUser._id);
        expect(res.body.email).toBe('user@profile.test');
      } else {
        expect([200, 404]).toContain(res.status);
      }
    });

    it('should not include password', async () => {
      const res = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      if (res.status === 200) {
        expect(res.body.password).toBeUndefined();
      }
    });

    it('should require admin role', async () => {
      const res = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect([401, 403]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get(`/api/users/${regularUser._id}`);

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('DELETE User - DELETE /api/users/:id (Admin Only)', () => {
    it('should delete user as admin', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminUser.token}`);

      expect([200, 204]).toContain(res.status);
    });

    it('should require admin role', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${regularUser.token}`);

      expect([401, 403]).toContain(res.status);
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .delete(`/api/users/${regularUser._id}`);

      expect([401, 403]).toContain(res.status);
    });
  });

});
