const mongoose = require('mongoose');
require('dotenv').config();

// Simple test without FormData
const testSimpleOrder = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medireach');
    console.log('✅ Connected to MongoDB');

    // Test direct service call
    const romsService = require('./Services/romsService');
    
    const sampleOrderData = {
      patient_id: 'PAT-TEST-002',
      pharmacy_id: 'Gampaha Pharmacy',
      priority_level: 'Normal',
      expiry_time: new Date(Date.now() + 48 * 60 * 60 * 1000),
      notes: 'Test order without FormData',
      medicines: [
        {
          medicine_id: '507f1f77bcf86cd799439011',
          medicine_name: 'Paracetamol 500mg',
          quantity: 2,
          unit_price: 120,
          total_price: 240
        },
        {
          medicine_id: '507f1f77bcf86cd799439012',
          medicine_name: 'Cetirizine 10mg',
          quantity: 1,
          unit_price: 95,
          total_price: 95
        }
      ]
    };

    console.log('📋 Testing direct service call...');
    console.log('Medicines to be ordered:');
    sampleOrderData.medicines.forEach((med, idx) => {
      console.log(`  ${idx + 1}. ${med.medicine_name} - Qty: ${med.quantity} - Total: LKR ${med.total_price}`);
    });

    const result = await romsService.createRequest(sampleOrderData, sampleOrderData.patient_id);
    
    console.log('\n✅ Order created successfully!');
    console.log('Order ID:', result._id);
    console.log('Patient ID:', result.patient_id);
    console.log('Pharmacy:', result.pharmacy_id);
    console.log('Status:', result.status);
    console.log('Medicines in order:');
    result.medicines.forEach((med, idx) => {
      console.log(`  ${idx + 1}. ${med.medicine_name} - Qty: ${med.quantity} - Total: LKR ${med.total_price}`);
    });

    console.log('\n🎉 Direct service test completed successfully!');
    console.log('This confirms the medicines array is working at the service level.');

  } catch (error) {
    console.error('❌ Error testing direct service:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testSimpleOrder();
