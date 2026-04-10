const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
const Pharmacy = require('./Models/pharmacyModel');
require('dotenv').config();

async function addSampleOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Get active pharmacies
    const pharmacies = await Pharmacy.find({ isActive: true });
    console.log(`\n🏥 Found ${pharmacies.length} active pharmacies`);

    // Clear existing orders to start fresh
    await MedicationRequest.deleteMany({});
    console.log('🗑️ Cleared existing orders');

    // Sample order data
    const sampleOrders = [
      {
        patient_id: 'PAT-001',
        pharmacy_id: 'Gampaha Pharmacy',
        status: 'Pending',
        priority_level: 'Normal',
        notes: 'Amoxicillin 500mg - 10 days supply',
        request_date: new Date(),
        expiry_time: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
      },
      {
        patient_id: 'PAT-002',
        pharmacy_id: 'Gampaha Pharmacy',
        status: 'Approved',
        priority_level: 'Urgent',
        notes: 'Paracetamol 500mg - Fever treatment',
        request_date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {
        patient_id: 'PAT-003',
        pharmacy_id: 'Test Pharmacy 2',
        status: 'Ready',
        priority_level: 'Normal',
        notes: 'Ibuprofen 400mg - Pain relief',
        request_date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        expiry_time: new Date(Date.now() + 36 * 60 * 60 * 1000) // 36 hours from now
      },
      {
        patient_id: 'PAT-004',
        pharmacy_id: 'Test Pharmacy 2',
        status: 'Pending',
        priority_level: 'Emergency',
        notes: 'Salbutamol Inhaler - Asthma emergency',
        request_date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        expiry_time: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
      },
      {
        patient_id: 'PAT-005',
        pharmacy_id: 'Uduwella',
        status: 'Rejected',
        priority_level: 'Normal',
        notes: 'Vitamin D3 - Out of stock',
        request_date: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        expiry_time: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
      },
      {
        patient_id: 'PAT-006',
        pharmacy_id: 'MediReach',
        status: 'Pending',
        priority_level: 'Urgent',
        notes: 'Metformin 850mg - Diabetes medication',
        request_date: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      },
      {
        patient_id: 'PAT-007',
        pharmacy_id: 'MediReach',
        status: 'Approved',
        priority_level: 'Normal',
        notes: 'Amlodipine 5mg - Blood pressure medication',
        request_date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        expiry_time: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
      }
    ];

    // Insert sample orders
    const insertedOrders = await MedicationRequest.insertMany(sampleOrders);
    console.log(`\n✅ Inserted ${insertedOrders.length} sample orders`);

    // Show distribution
    console.log('\n📊 Order Distribution:');
    const distribution = {};
    insertedOrders.forEach(order => {
      distribution[order.pharmacy_id] = (distribution[order.pharmacy_id] || 0) + 1;
    });

    Object.keys(distribution).forEach(pharmacy => {
      console.log(`   ${pharmacy}: ${distribution[pharmacy]} orders`);
    });

    // Test filtering
    console.log('\n🧪 Testing Pharmacy Filtering:');
    
    for (const pharmacy of pharmacies) {
      const orders = await MedicationRequest.find({ 
        pharmacy_id: pharmacy.name 
      }).sort({ createdAt: -1 });
      
      console.log(`\n   ${pharmacy.name}:`);
      console.log(`     Orders found: ${orders.length}`);
      
      orders.forEach((order, i) => {
        console.log(`     ${i+1}. ${order.patient_id} - ${order.status} - ${order.priority_level}`);
        console.log(`        Notes: ${order.notes}`);
      });
    }

    console.log('\n🎯 Sample Data Added Successfully!');
    console.log('✅ Ready to test PharmacyOrders page with real data');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

addSampleOrders();
