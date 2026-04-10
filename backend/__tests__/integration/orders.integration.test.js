/**
 * Orders/ROMS Integration Tests
 * Tests medication request and order handling workflow
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { startDB, stopDB, clearDB } = require('./setup');
const { createTestUser, createTestPharmacy, createTestMedicationRequest } = require('./testUtils');

let app;
let User;
let MedicationRequest;
let authToken;
let pharmacyToken;
let testUserId;
let testPharmacyId;

beforeAll(async () => {
  await startDB();
  app = require('../../app');
  User = require('../../Models/userModel');
  
  // Try to load MedicationRequest model
  try {
    MedicationRequest = require('../../Model/MedicationRequest') || mongoose.model('MedicationRequest');
  } catch (e) {
    console.warn('MedicationRequest model not found, skipping model-specific tests');
  }
  
  await new Promise(resolve => setTimeout(resolve, 100));
});

afterAll(async () => {
  await stopDB();
});

beforeEach(async () => {
  await clearDB();
  
  // Register and login a test user
  const userData = createTestUser();
  await request(app)
    .post('/api/auth/register')
    .send(userData);
  
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: userData.email,
      password: userData.password,
    });
  
  authToken = loginResponse.body.data?.token;
  const user = await User.findOne({ email: userData.email });
  testUserId = user?._id;
  
  // Register a pharmacy user
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
});

// ─── Medication Request Tests ─────────────────────────────────────────────

describe('Orders Integration - Medication Request', () => {
  it('should create a medication request with valid data', async () => {
    const requestData = createTestMedicationRequest({
      user_id: testUserId,
    });
    
    const response = await request(app)
      .post('/api/roms/request')
      .set('Authorization', `Bearer ${authToken}`)
      .send(requestData)
      .expect(201);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.medicationRequest).toBeDefined();
    expect(response.body.data.medicationRequest.status).toBe('pending');
  });

  it('should fail to create medication request without authentication', async () => {
    const requestData = createTestMedicationRequest({
      user_id: testUserId,
    });
    
    const response = await request(app)
      .post('/api/roms/request')
      .send(requestData)
      .expect(401);
    
    expect(response.body.status).toBe('error');
  });

  it('should retrieve medication requests for authenticated user', async () => {
    // Create a request first
    await request(app)
      .post('/api/roms/request')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTestMedicationRequest({ user_id: testUserId }));
    
    const response = await request(app)
      .get('/api/roms/my-requests')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should update medication request status', async () => {
    // Create a request
    const createResponse = await request(app)
      .post('/api/roms/request')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTestMedicationRequest({ user_id: testUserId }))
      .expect(201);
    
    const requestId = createResponse.body.data.medicationRequest._id;
    
    // Update the request
    const updateResponse = await request(app)
      .put(`/api/roms/request/${requestId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        status: 'approved',
        medicine_notes: 'Updated notes',
      })
      .expect(200);
    
    expect(updateResponse.body.data.medicationRequest.status).toBe('approved');
  });

  it('should delete a medication request', async () => {
    // Create a request
    const createResponse = await request(app)
      .post('/api/roms/request')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTestMedicationRequest({ user_id: testUserId }))
      .expect(201);
    
    const requestId = createResponse.body.data.medicationRequest._id;
    
    // Delete the request
    await request(app)
      .delete(`/api/roms/request/${requestId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    // Verify it's deleted
    const getResponse = await request(app)
      .get(`/api/roms/request/${requestId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});

// ─── Pharmacy Order Processing Tests ───────────────────────────────────────

describe('Orders Integration - Pharmacy Processing', () => {
  it('should retrieve pharmacy tasks', async () => {
    const response = await request(app)
      .get('/api/roms/pharmacy-tasks')
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .expect(200);
    
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should process a medication request (accept)', async () => {
    // Create a medication request
    const createResponse = await request(app)
      .post('/api/roms/request')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTestMedicationRequest({ user_id: testUserId }))
      .expect(201);
    
    const requestId = createResponse.body.data.medicationRequest._id;
    
    // Pharmacy processes it
    const processResponse = await request(app)
      .put(`/api/roms/${requestId}/process`)
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .send({
        action: 'accept',
        pharmacy_id: testPharmacyId,
      })
      .expect(200);
    
    expect(processResponse.body.data).toBeDefined();
  });

  it('should reject a medication request with reason', async () => {
    // Create a medication request
    const createResponse = await request(app)
      .post('/api/roms/request')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTestMedicationRequest({ user_id: testUserId }))
      .expect(201);
    
    const requestId = createResponse.body.data.medicationRequest._id;
    
    // Pharmacy rejects it
    const rejectResponse = await request(app)
      .put(`/api/roms/${requestId}/process`)
      .set('Authorization', `Bearer ${pharmacyToken}`)
      .send({
        action: 'reject',
        pharmacy_id: testPharmacyId,
        rejectionReason: 'Medicine not in stock',
      })
      .expect(200);
    
    expect(rejectResponse.body.data).toBeDefined();
  });
});

// ─── Order Cancellation Tests ──────────────────────────────────────────────

describe('Orders Integration - Cancellation', () => {
  it('should cancel a medication request', async () => {
    // Create a request
    const createResponse = await request(app)
      .post('/api/roms/request')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createTestMedicationRequest({ user_id: testUserId }))
      .expect(201);
    
    const requestId = createResponse.body.data.medicationRequest._id;
    
    // Cancel the request
    const cancelResponse = await request(app)
      .post('/api/cancellation/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        request_id: requestId,
        cancelled_by: testUserId,
        cancel_reason: 'Patient changed mind',
      })
      .expect(201);
    
    expect(cancelResponse.body.data).toBeDefined();
  });

  it('should retrieve cancellation history', async () => {
    const response = await request(app)
      .get('/api/cancellation/all')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
