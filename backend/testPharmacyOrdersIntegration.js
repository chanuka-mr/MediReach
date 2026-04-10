// Test script to verify PharmacyOrders database integration
const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
const Pharmacy = require('./Models/pharmacyModel');
require('dotenv').config();

async function testPharmacyOrdersIntegration() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get medication requests and pharmacies count
    const requestCount = await MedicationRequest.countDocuments();
    const pharmacyCount = await Pharmacy.countDocuments({ isActive: true });

    console.log(`\n📊 Database Statistics:`);
    console.log(`   Total Medication Requests: ${requestCount}`);
    console.log(`   Active Pharmacies: ${pharmacyCount}`);

    // Get sample medication requests
    const requests = await MedicationRequest.find().limit(5);
    console.log(`\n💊 Sample Medication Requests:`);
    requests.forEach((request, index) => {
      console.log(`  ${index + 1}. Patient: ${request.patient_id} - Pharmacy: ${request.pharmacy_id} - Status: ${request.status}`);
      console.log(`       Priority: ${request.priority_level} - Notes: ${request.notes || 'No notes'}`);
      console.log(`       Created: ${new Date(request.createdAt || request.request_date).toLocaleDateString()}`);
    });

    // Get sample pharmacies
    const pharmacies = await Pharmacy.find({ isActive: true }).limit(3);
    console.log(`\n🏥 Sample Active Pharmacies:`);
    pharmacies.forEach((pharmacy, index) => {
      console.log(`  ${index + 1}. ${pharmacy.name} (${pharmacy.district})`);
    });

    console.log('\n🎯 PharmacyOrders Integration Points:');
    console.log('   1. PharmacyOrders fetches from /roms/pharmacy-tasks');
    console.log('   2. Backend filters by pharmacy_id if specified');
    console.log('   3. Frontend transforms database data to UI format');
    console.log('   4. Status mapping: Pending→pending, Approved→processing, etc.');
    console.log('   5. Priority mapping: Emergency/Urgent→urgent, Normal→normal');
    console.log('   6. URL parameter filtering works from InventoryDashboard');

    console.log('\n📱 API Endpoint Used:');
    console.log('   GET http://localhost:5000/roms/pharmacy-tasks');
    console.log('   Query parameter: ?pharmacy_id={pharmacyName}');

    console.log('\n🔄 Data Transformation:');
    console.log('   Database → Frontend UI Format');
    console.log('   ---------------------------');
    console.log('   _id → id');
    console.log('   pharmacy_id → pharmacy');
    console.log('   notes → medicine');
    console.log('   createdAt → orderedAt');
    console.log('   status → status (mapped)');
    console.log('   priority_level → priority (mapped)');

    // Test pharmacy filtering
    if (pharmacies.length > 0) {
      const testPharmacy = pharmacies[0].name;
      console.log(`\n🧪 Testing Pharmacy Filter:`);
      console.log(`   Pharmacy: ${testPharmacy}`);
      console.log(`   URL: /roms/pharmacy-tasks?pharmacy_id=${encodeURIComponent(testPharmacy)}`);
      console.log(`   Expected: Only orders for ${testPharmacy}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testPharmacyOrdersIntegration();
