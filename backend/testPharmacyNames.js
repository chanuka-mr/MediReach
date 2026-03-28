const mongoose = require('mongoose');
const Pharmacy = require('./Models/pharmacyModel');
const MedicationRequest = require('./Model/MedicationRequest');
require('dotenv').config();

async function testPharmacyNames() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Get active pharmacies
    const pharmacies = await Pharmacy.find({ isActive: true });
    console.log('\n🏥 Active Pharmacies:');
    pharmacies.forEach((p, i) => {
      console.log(`${i+1}. ${p.name} (${p._id})`);
    });

    // Get medication requests with pharmacy mapping
    const requests = await MedicationRequest.find().limit(10);
    console.log('\n📋 Orders with Pharmacy IDs:');
    requests.forEach((r, i) => {
      console.log(`${i+1}. Pharmacy ID: ${r.pharmacy_id} | Status: ${r.status}`);
    });

    // Check if any pharmacy names match the pharmacy_id patterns
    const pharmacyNames = pharmacies.map(p => p.name);
    const pharmacyIds = await MedicationRequest.distinct('pharmacy_id');
    
    console.log('\n🔍 Pharmacy Name vs ID Matching:');
    console.log('Pharmacy Names:', pharmacyNames);
    console.log('Pharmacy IDs in Orders:', pharmacyIds);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testPharmacyNames();
