/**
 * Pharmacy Integration Tests
 * Tests pharmacy-specific functionality and workflows
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestPharmacy, createTestUser, createTestInquiry } = require('./testUtils');

let app;
let User;
let Inquiry;
let pharmacyToken;
let userToken;
let testPharmacyId;
let testUserId;

beforeAll(async () => {
  await startDB();
  app = require('../../app');
  User = require('../../Models/userModel');
  Inquiry = require('../../Models/inquiryModel');
  
  await new Promise(resolve => setTimeout(resolve, 100));
});

afterAll(async () => {
  await stopDB();
});

beforeEach(async () => {
  await clearDB();
  
  // Create and authenticate pharmacy
  const pharmacyData = createTestPharmacy();
  await request(app)
    .post('/api/auth/register')
    .send(pharmacyData);
  
  const pharmacyLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: pharmacyData.email,
      password: pharmacyData.password,
    });
  
  pharmacyToken = pharmacyLoginResponse.body.data?.token;
  const pharmacy = await User.findOne({ email: pharmacyData.email });
  testPharmacyId = pharmacy?._id;
  
  // Create and authenticate regular user
  const userData = createTestUser();
  await request(app)
    .post('/api/auth/register')
    .send(userData);
  
  const userLoginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: userData.email,
      password: userData.password,
    });
  
  userToken = userLoginResponse.body.data?.token;
  const user = await User.findOne({ email: userData.email });
  testUserId = user?._id;
});

// ─── Pharmacy Profile Tests ──────────────────────────────────────────────

describe('Pharmacy Integration - Profile', () => {
  it('should retrieve pharmacy profile', async () => {
    const response = await request(app)
      .get('/api/pharmacy/profile')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.pharmacy).toBeDefined();
    expect(response.body.data.pharmacy.role).toBe('pharmacy');
  });

  it('should update pharmacy profile', async () => {
    const updateData = {
      address: '456 Pharmacy Street',
      city: 'Colombo',
      province: 'Western',
      contactNumber: '+94771234567',
    };
    
    const response = await request(app)
      .put('/api/pharmacy/profile')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .send(updateData)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.pharmacy.address).toBe(updateData.address);
  });

  it('should fail to update profile without authentication', async () => {
    const response = await request(app)
      .put('/api/pharmacy/profile')
      .send({ address: 'New Address' })
      .expect(401);
    
    expect(response.body.status).toBe('error');
  });
});

// ─── Pharmacy Inquiry Tests ──────────────────────────────────────────────

describe('Pharmacy Integration - Inquiries', () => {
  it('should create an inquiry', async () => {
    const inquiryData = createTestInquiry({
      email: 'user@example.com',
    });
    
    const response = await request(app)
      .post('/api/inquiry/create')
      .send(inquiryData)
      .expect(201);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.inquiry).toBeDefined();
    expect(response.body.data.inquiry.status).toBe('open');
  });

  it('should retrieve all inquiries for pharmacy admin', async () => {
    // Create some inquiries
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/inquiry/create')
        .send(createTestInquiry({ email: `user${i}@example.com` }));
    }
    
    const response = await request(app)
      .get('/api/inquiry/all')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('should update inquiry status', async () => {
    const inquiryData = createTestInquiry();
    const createResponse = await request(app)
      .post('/api/inquiry/create')
      .send(inquiryData);
    
    const inquiryId = createResponse.body.data.inquiry._id;
    
    const updateResponse = await request(app)
      .put(`/api/inquiry/${inquiryId}`)
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .send({ status: 'closed' })
      .expect(200);
    
    expect(updateResponse.body.data.inquiry.status).toBe('closed');
  });

  it('should delete an inquiry', async () => {
    const inquiryData = createTestInquiry();
    const createResponse = await request(app)
      .post('/api/inquiry/create')
      .send(inquiryData);
    
    const inquiryId = createResponse.body.data.inquiry._id;
    
    await request(app)
      .delete(`/api/inquiry/${inquiryId}`)
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    // Verify it's deleted
    const getResponse = await request(app)
      .get(`/api/inquiry/${inquiryId}`)
      .expect(404);
  });
});

// ─── Pharmacy Dashboard Tests ─────────────────────────────────────────────

describe('Pharmacy Integration - Dashboard', () => {
  it('should retrieve pharmacy dashboard statistics', async () => {
    const response = await request(app)
      .get('/api/dashboard/pharmacy-stats')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeDefined();
  });

  it('should retrieve pharmacy orders summary', async () => {
    const response = await request(app)
      .get('/api/dashboard/pharmacy-orders')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data) || typeof response.body.data === 'object').toBe(true);
  });

  it('should retrieve pharmacy performance metrics', async () => {
    const response = await request(app)
      .get('/api/dashboard/pharmacy-metrics')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
  });
});

// ─── Pharmacy Reports Tests ──────────────────────────────────────────────

describe('Pharmacy Integration - Reports', () => {
  it('should generate pharmacy report', async () => {
    const response = await request(app)
      .get('/api/reports/pharmacy')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data).toBeDefined();
  });

  it('should filter report by date range', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const response = await request(app)
      .get('/api/reports/pharmacy')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .query({
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      })
      .expect(200);
    
    expect(response.body.status).toBe('success');
  });
});

// ─── Pharmacy Medicine Management Tests ──────────────────────────────────

describe('Pharmacy Integration - Medicine Management', () => {
  it('should retrieve available medicines', async () => {
    const response = await request(app)
      .get('/api/drug/available')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(Array.isArray(response.body.data) || response.body.status === 'success').toBe(true);
  });

  it('should search medicines by name', async () => {
    const response = await request(app)
      .get('/api/drug/search')
      .query({ query: 'paracetamol' })
      .expect(200);
    
    expect(response.body.status === 'success' || Array.isArray(response.body.data)).toBe(true);
  });
});
