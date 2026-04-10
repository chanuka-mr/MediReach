const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
const Pharmacy = require('./Models/pharmacyModel');
require('dotenv').config();

async function testMedicationRequestData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // 1. Get all medication requests from the database
    const allRequests = await MedicationRequest.find().sort({ createdAt: -1 });
    console.log(`\n📋 Total Medication Requests in Database: ${allRequests.length}`);

    // 2. Show sample data structure
    if (allRequests.length > 0) {
      console.log('\n📄 Sample MedicationRequest Structure:');
      const sample = allRequests[0];
      console.log(`  _id: ${sample._id}`);
      console.log(`  patient_id: ${sample.patient_id}`);
      console.log(`  pharmacy_id: ${sample.pharmacy_id}`);
      console.log(`  status: ${sample.status}`);
      console.log(`  priority_level: ${sample.priority_level}`);
      console.log(`  notes: ${sample.notes || 'No notes'}`);
      console.log(`  request_date: ${sample.request_date}`);
      console.log(`  createdAt: ${sample.createdAt}`);
      console.log(`  expiry_time: ${sample.expiry_time}`);
    }

    // 3. Group by pharmacy_id
    const groupedByPharmacy = {};
    allRequests.forEach(request => {
      const pharmacyId = request.pharmacy_id || 'Unknown';
      if (!groupedByPharmacy[pharmacyId]) {
        groupedByPharmacy[pharmacyId] = [];
      }
      groupedByPharmacy[pharmacyId].push(request);
    });

    console.log('\n🏥 Orders by Pharmacy:');
    Object.keys(groupedByPharmacy).forEach(pharmacyId => {
      console.log(`  ${pharmacyId}: ${groupedByPharmacy[pharmacyId].length} orders`);
    });

    // 4. Test pharmacy filtering for each pharmacy
    console.log('\n🧪 Testing Pharmacy Filtering:');
    const pharmacyIds = Object.keys(groupedByPharmacy);
    
    for (const pharmacyId of pharmacyIds.slice(0, 3)) { // Test first 3 pharmacies
      const filteredRequests = await MedicationRequest.find({ 
        pharmacy_id: { $in: [pharmacyId, pharmacyId.replace(/-/g, '_'), pharmacyId.replace(/_/g, '-')] }
      }).sort({ createdAt: -1 });
      
      console.log(`\n  Pharmacy: ${pharmacyId}`);
      console.log(`    Database count: ${groupedByPharmacy[pharmacyId].length}`);
      console.log(`    Query result: ${filteredRequests.length}`);
      
      if (filteredRequests.length > 0) {
        console.log(`    Sample order: ${filteredRequests[0].patient_id} - ${filteredRequests[0].status}`);
      }
    }

    // 5. Get pharmacy names and map to IDs
    console.log('\n🏢 Pharmacy Names and ID Mapping:');
    const pharmacies = await Pharmacy.find({ isActive: true }).sort({ _id: 1 });
    
    for (let i = 0; i < pharmacies.length; i++) {
      const pharmacy = pharmacies[i];
      const mappedId = `PHARM-${String(i + 1).padStart(3, '0')}`;
      const orderCount = groupedByPharmacy[mappedId]?.length || 0;
      
      console.log(`  ${pharmacy.name}`);
      console.log(`    Database ID: ${mappedId}`);
      console.log(`    Orders: ${orderCount}`);
      
      if (orderCount > 0) {
        const sampleOrder = groupedByPharmacy[mappedId][0];
        console.log(`    Sample: ${sampleOrder.patient_id} - ${sampleOrder.status}`);
      }
    }

    // 6. Verify API endpoint data structure
    console.log('\n🌐 API Data Structure Verification:');
    console.log('The PharmacyOrders component expects this structure:');
    console.log('  id (string) - Order ID');
    console.log('  pharmacy (string) - Pharmacy name');
    console.log('  medicine (string) - Medicine description');
    console.log('  status (string) - Order status (mapped)');
    console.log('  priority (string) - Priority level (mapped)');
    console.log('  orderedAt (date) - Order date');
    
    console.log('\nDatabase fields to UI mapping:');
    console.log('  _id → id');
    console.log('  pharmacy_id → pharmacy');
    console.log('  notes → medicine');
    console.log('  status → status (mapped)');
    console.log('  priority_level → priority (mapped)');
    console.log('  createdAt → orderedAt');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testMedicationRequestData();
