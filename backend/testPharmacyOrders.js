// Test script to demonstrate pharmacy orders filtering
const mongoose = require('mongoose');
const Pharmacy = require('./Models/pharmacyModel');
require('dotenv').config();

async function testPharmacyOrders() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all pharmacies to show what's available
    const pharmacies = await Pharmacy.find({ isActive: true });
    console.log(`\n📋 Found ${pharmacies.length} active pharmacies:`);
    pharmacies.forEach((pharmacy, index) => {
      console.log(`  ${index + 1}. ${pharmacy.name} (${pharmacy.district})`);
    });

    if (pharmacies.length > 0) {
      const samplePharmacy = pharmacies[0];
      console.log(`\n🎯 Example: Clicking Orders button for "${samplePharmacy.name}"`);
      console.log(`   → Navigates to: /orders?pharmacy=${encodeURIComponent(samplePharmacy.name)}`);
      console.log(`   → Shows: Orders specifically for ${samplePharmacy.name}`);
      console.log(`   → Features: Breadcrumb, filtered stats, back button`);
    }

    console.log('\n📱 Integration Points:');
    console.log('   1. Inventory Dashboard → Orders button → /orders?pharmacy={name}');
    console.log('   2. PharmacyOrders component reads URL parameter');
    console.log('   3. Filters orders by pharmacy name');
    console.log('   4. Shows pharmacy-specific stats and breadcrumb');
    console.log('   5. "Back to all orders" button clears filter');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testPharmacyOrders();
