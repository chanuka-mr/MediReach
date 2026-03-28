// Test script to verify medicine shop database integration
const mongoose = require('mongoose');
const Medicine = require('./Model/medicineModel');
const Pharmacy = require('./Models/pharmacyModel');
require('dotenv').config();

async function testMedicineShop() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get medicines and pharmacies count
    const medicineCount = await Medicine.countDocuments();
    const pharmacyCount = await Pharmacy.countDocuments({ isActive: true });

    console.log(`\n📊 Database Statistics:`);
    console.log(`   Total Medicines: ${medicineCount}`);
    console.log(`   Active Pharmacies: ${pharmacyCount}`);

    // Get sample medicines
    const medicines = await Medicine.find().limit(5);
    console.log(`\n💊 Sample Medicines:`);
    medicines.forEach((medicine, index) => {
      console.log(`  ${index + 1}. ${medicine.mediName} - LKR ${medicine.mediPrice} - Stock: ${medicine.mediStock}`);
    });

    // Get sample pharmacies
    const pharmacies = await Pharmacy.find({ isActive: true }).limit(3);
    console.log(`\n🏥 Sample Active Pharmacies:`);
    pharmacies.forEach((pharmacy, index) => {
      console.log(`  ${index + 1}. ${pharmacy.name} (${pharmacy.district})`);
    });

    console.log('\n🎯 Medicine Shop Integration Points:');
    console.log('   1. MedicineCardView fetches from /api/medicines');
    console.log('   2. Pharmacy data from /api/pharmacies');
    console.log('   3. Groups medicines by pharmacy.Pharmacy field');
    console.log('   4. Displays cards with real database data');
    console.log('   5. Cart integration with localStorage');
    console.log('   6. Order form pre-fill from cart');

    console.log('\n📱 API Endpoints Used:');
    console.log('   GET http://localhost:5000/medicines');
    console.log('   GET http://localhost:5000/api/pharmacies');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testMedicineShop();
