const mongoose = require('mongoose');
const Pharmacy = require('./Models/pharmacyModel');
const MedicationRequest = require('./Model/MedicationRequest');
require('dotenv').config();

async function testPharmacyMapping() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // Get all active pharmacies with their order
    const pharmacies = await Pharmacy.find({ isActive: true }).sort({ _id: 1 });
    console.log('\n🏥 Active Pharmacies with Mapped IDs:');
    
    for (let i = 0; i < pharmacies.length; i++) {
      const pharmacy = pharmacies[i];
      const mappedId = `PHARM-${String(i + 1).padStart(3, '0')}`;
      
      // Check if orders exist for this mapped ID
      const orderCount = await MedicationRequest.countDocuments({ 
        pharmacy_id: { $in: [mappedId, mappedId.replace(/-/g, '_'), mappedId.replace(/_/g, '-')] }
      });
      
      console.log(`${i+1}. ${pharmacy.name} → ${mappedId} (${orderCount} orders)`);
    }

    // Test specific mapping
    console.log('\n🧪 Testing Specific Pharmacy Name Mapping:');
    const testPharmacy = 'Gampaha Pharmacy';
    const pharmacy = await Pharmacy.findOne({ name: testPharmacy, isActive: true });
    
    if (pharmacy) {
      const pharmacyIndex = await Pharmacy.countDocuments({ _id: { $lt: pharmacy._id } });
      const mappedId = `PHARM-${String(pharmacyIndex + 1).padStart(3, '0')}`;
      const orders = await MedicationRequest.find({ 
        pharmacy_id: { $in: [mappedId, mappedId.replace(/-/g, '_'), mappedId.replace(/_/g, '-')] }
      });
      
      console.log(`${testPharmacy} → ${mappedId}`);
      console.log(`Orders found: ${orders.length}`);
      orders.forEach((order, i) => {
        console.log(`  ${i+1}. ${order.patient_id} - ${order.status} - ${order.notes || 'No notes'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testPharmacyMapping();
