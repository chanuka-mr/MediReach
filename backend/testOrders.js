const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
require('dotenv').config();

async function testOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    const requests = await MedicationRequest.find().limit(10);
    console.log('\n📋 Sample Medication Requests:');
    requests.forEach((r, i) => {
      console.log(`${i+1}. Pharmacy: ${r.pharmacy_id} | Status: ${r.status} | Patient: ${r.patient_id}`);
    });

    // Check unique pharmacies
    const uniquePharmacies = await MedicationRequest.distinct('pharmacy_id');
    console.log(`\n🏥 Unique Pharmacies in Orders: ${uniquePharmacies.length}`);
    uniquePharmacies.forEach((p, i) => {
      console.log(`${i+1}. ${p}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testOrders();
