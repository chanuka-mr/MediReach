/**
 * Test Utilities
 * Helper functions for integration tests
 */

const bcrypt = require('bcryptjs');

// ─── User Factory ──────────────────────────────────────────────────────────

/**
 * Create a test user object
 */
const createTestUser = (overrides = {}) => {
  return {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'Test123!@#',
    contactNumber: '+94771234567',
    role: 'user',
    ...overrides,
  };
};

/**
 * Create a test pharmacy user object
 */
const createTestPharmacy = (overrides = {}) => {
  return {
    name: 'Test Pharmacy',
    email: 'pharmacy@example.com',
    password: 'Pharma123!@#',
    contactNumber: '+94772234567',
    role: 'pharmacy',
    pharmacyName: 'Test Pharmacy',
    licenseNumber: 'LIC001',
    address: '123 Main St',
    city: 'Colombo',
    province: 'Western',
    postalCode: '00100',
    ...overrides,
  };
};

// ─── Order Factory ─────────────────────────────────────────────────────────

/**
 * Create a test medication request object
 */
const createTestMedicationRequest = (overrides = {}) => {
  return {
    user_id: null, // Will be set in tests
    pharmacy_id: null, // Will be set in tests
    status: 'pending',
    medicines: [
      {
        medicine_name: 'Paracetamol',
        quantity: 10,
        dosage: '500mg',
        frequency: 'twice daily',
      },
    ],
    prescription_image: 'http://example.com/prescription.jpg',
    notes: 'Test medication request',
    created_at: new Date(),
    ...overrides,
  };
};

/**
 * Create a test order object
 */
const createTestOrder = (overrides = {}) => {
  return {
    user_id: null,
    pharmacy_id: null,
    medicines: [
      {
        name: 'Aspirin',
        quantity: 5,
        price: 50,
      },
    ],
    total_amount: 50,
    status: 'pending',
    payment_status: 'pending',
    ...overrides,
  };
};

// ─── Inquiry Factory ───────────────────────────────────────────────────────

/**
 * Create a test inquiry object
 */
const createTestInquiry = (overrides = {}) => {
  return {
    name: 'Inquiry User',
    email: 'inquirer@example.com',
    subject: 'Test Inquiry',
    message: 'This is a test inquiry message',
    status: 'Pending',
    priority: 'Medium',
    ...overrides,
  };
};

// ─── Seed Database ────────────────────────────────────────────────────────

/**
 * Seed test data to database
 */
const seedDB = async (models) => {
  const { User, Inquiry } = models;
  
  try {
    // Create test users
    const testUser = createTestUser();
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    const user = await User.create({
      ...testUser,
      password: hashedPassword,
    });
    
    // Create test inquiry
    await Inquiry.create(createTestInquiry());
    
    return { user };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = {
  createTestUser,
  createTestPharmacy,
  createTestMedicationRequest,
  createTestOrder,
  createTestInquiry,
  seedDB,
};
