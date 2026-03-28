const mongoose = require('mongoose');
require('dotenv').config();

// Test the cart order creation flow
const testCartOrder = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medireach');
    console.log('✅ Connected to MongoDB');

    // Sample cart data (simulating what comes from frontend)
    const sampleOrderData = {
      patient_id: 'PAT-TEST-001',
      pharmacy_id: 'Gampaha Pharmacy',
      priority_level: 'Normal',
      expiry_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16),
      notes: 'Test order from cart functionality'
    };

    const medicines = [
      {
        medicine_id: '507f1f77bcf86cd799439011', // Sample ObjectId
        medicine_name: 'Paracetamol 500mg',
        quantity: 3,
        unit_price: 120,
        total_price: 360
      },
      {
        medicine_id: '507f1f77bcf86cd799439012',
        medicine_name: 'Cetirizine 10mg',
        quantity: 2,
        unit_price: 95,
        total_price: 190
      }
    ];

    console.log('📋 Creating order with cart data...');
    console.log('Medicines to be ordered:');
    medicines.forEach((med, idx) => {
      console.log(`  ${idx + 1}. ${med.medicine_name} - Qty: ${med.quantity} - Total: LKR ${med.total_price}`);
    });

    // Create FormData like the frontend does
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add form fields
    Object.keys(sampleOrderData).forEach(key => {
      formData.append(key, sampleOrderData[key]);
    });
    
    // Add medicines array as JSON string
    formData.append('medicines', JSON.stringify(medicines));

    // Make API call to create order
    const response = await fetch('http://localhost:5000/api/roms/request', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('\n✅ Order created successfully!');
    console.log('Order ID:', result._id);
    console.log('Patient ID:', result.patient_id);
    console.log('Pharmacy:', result.pharmacy_id);
    console.log('Status:', result.status);
    console.log('Medicines in order:');
    result.medicines.forEach((med, idx) => {
      console.log(`  ${idx + 1}. ${med.medicine_name} - Qty: ${med.quantity} - Total: LKR ${med.total_price}`);
    });

    console.log('\n🎉 Cart order creation test completed successfully!');
    console.log('You can now view this order in the PharmacyOrders page with proper medicine names.');

  } catch (error) {
    console.error('❌ Error testing cart order:', error);
  } finally {
    await mongoose.disconnect();
  }
};

testCartOrder();
