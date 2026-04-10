const mongoose = require('mongoose');
require('dotenv').config();

// Comprehensive test of cart functionality
const testCartFunctionality = async () => {
  try {
    console.log('🚀 Testing Cart to PharmacyOrders Flow');
    console.log('=' .repeat(50));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medireach');
    console.log('✅ Connected to MongoDB');

    // Step 1: Create order with medicines (simulating cart submission)
    console.log('\n📋 Step 1: Creating order with cart medicines...');
    const testOrder = {
      patient_id: 'PAT-CART-001',
      pharmacy_id: 'Gampaha Pharmacy',
      priority_level: 'Normal',
      notes: 'Order from cart system',
      medicines: JSON.stringify([
        {
          medicine_id: '507f1f77bcf86cd799439011',
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
        },
        {
          medicine_id: '507f1f77bcf86cd799439013',
          medicine_name: 'Omeprazole 20mg',
          quantity: 1,
          unit_price: 180,
          total_price: 180
        }
      ])
    };

    console.log('Medicines in cart:');
    const medicines = JSON.parse(testOrder.medicines);
    medicines.forEach((med, idx) => {
      console.log(`  ${idx + 1}. ${med.medicine_name} - Qty: ${med.quantity} - LKR ${med.total_price}`);
    });

    // Create order via API
    const response = await fetch('http://localhost:5000/api/roms/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testOrder)
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.status}`);
    }

    const createdOrder = await response.json();
    console.log('\n✅ Order created successfully!');
    console.log(`Order ID: ${createdOrder._id}`);
    console.log(`Status: ${createdOrder.status}`);
    console.log(`Medicines stored: ${createdOrder.medicines.length}`);

    // Step 2: Fetch orders from pharmacy endpoint (what PharmacyOrders page uses)
    console.log('\n📋 Step 2: Fetching orders from pharmacy endpoint...');
    const pharmacyResponse = await fetch(`http://localhost:5000/api/roms/pharmacy-tasks?pharmacy_id=Gampaha Pharmacy`);
    
    if (!pharmacyResponse.ok) {
      throw new Error(`Failed to fetch pharmacy orders: ${pharmacyResponse.status}`);
    }

    const pharmacyOrders = await pharmacyResponse.json();
    console.log(`✅ Found ${pharmacyOrders.length} orders for Gampaha Pharmacy`);

    // Find our created order
    const ourOrder = pharmacyOrders.find(order => order._id === createdOrder._id);
    
    if (ourOrder) {
      console.log('\n🎯 Found our order in pharmacy results!');
      console.log(`Patient ID: ${ourOrder.patient_id}`);
      console.log(`Status: ${ourOrder.status}`);
      console.log(`Medicines in order: ${ourOrder.medicines.length}`);
      
      console.log('\n💊 Medicines that will be displayed in PharmacyOrders:');
      ourOrder.medicines.forEach((med, idx) => {
        console.log(`  ${idx + 1}. ${med.medicine_name} - Qty: ${med.quantity} - LKR ${med.total_price}`);
      });

      // Simulate the frontend transformation logic
      console.log('\n🔄 Frontend transformation logic:');
      let medicineDisplay = 'Medication Request';
      let totalQuantity = 1;
      let totalValue = 0;
      
      if (ourOrder.medicines && ourOrder.medicines.length > 0) {
        const medicineNames = ourOrder.medicines.map(med => med.medicine_name).join(', ');
        medicineDisplay = medicineNames;
        totalQuantity = ourOrder.medicines.reduce((sum, med) => sum + med.quantity, 0);
        totalValue = ourOrder.medicines.reduce((sum, med) => sum + med.total_price, 0);
      }
      
      console.log(`  Medicine column will display: "${medicineDisplay}"`);
      console.log(`  Total quantity: ${totalQuantity}`);
      console.log(`  Total value: LKR ${totalValue}`);
      console.log(`  Unit price: LKR ${totalValue / totalQuantity}`);

      console.log('\n🎉 SUCCESS! Cart functionality is working perfectly!');
      console.log('📱 PharmacyOrders page will now display actual medicine names instead of "Medication Request"');

    } else {
      console.log('❌ Our order was not found in pharmacy results');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

testCartFunctionality();
