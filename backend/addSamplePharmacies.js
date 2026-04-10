const mongoose = require('mongoose');
const Pharmacy = require('./Models/pharmacyModel');
require('dotenv').config();

async function addSamplePharmacies() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if pharmacies already exist
    const existingCount = await Pharmacy.countDocuments();
    console.log(`Existing pharmacies: ${existingCount}`);

    if (existingCount > 0) {
      console.log('Pharmacies already exist. Skipping sample data creation.');
      return;
    }

    // Sample pharmacy data
    const samplePharmacies = [
      {
        name: 'Kandy Central Pharmacy',
        district: 'Kandy',
        location: { type: 'Point', coordinates: [80.6337, 7.2906] },
        contactNumber: '+94812234567',
        email: 'kandy@centralpharmacy.com',
        operatingHours: { open: '08:00', close: '22:00' },
        pharmacistName: 'Dr. A. Perera',
        isActive: true,
        address: 'No. 123, Kandy Street, Kandy'
      },
      {
        name: 'Galle Fort MedPoint',
        district: 'Galle',
        location: { type: 'Point', coordinates: [80.2176, 6.0535] },
        contactNumber: '+94911234567',
        email: 'galle@medpoint.com',
        operatingHours: { open: '09:00', close: '21:00' },
        pharmacistName: 'Dr. B. Silva',
        isActive: true,
        address: 'No. 45, Fort Street, Galle'
      },
      {
        name: 'Jaffna Community Rx',
        district: 'Jaffna',
        location: { type: 'Point', coordinates: [80.0073, 9.6615] },
        contactNumber: '+94211234567',
        email: 'jaffna@communityrx.com',
        operatingHours: { open: '08:00', close: '20:00' },
        pharmacistName: 'Dr. C. Kumar',
        isActive: true,
        address: 'No. 78, Hospital Road, Jaffna'
      },
      {
        name: 'Matara Rural Clinic',
        district: 'Matara',
        location: { type: 'Point', coordinates: [80.5530, 5.9549] },
        contactNumber: '+94411234567',
        email: 'matara@ruralclinic.com',
        operatingHours: { open: '07:00', close: '19:00' },
        pharmacistName: 'Dr. D. Fernando',
        isActive: true,
        address: 'No. 12, Main Street, Matara'
      },
      {
        name: 'Colombo City Pharmacy',
        district: 'Colombo',
        location: { type: 'Point', coordinates: [79.8612, 6.9271] },
        contactNumber: '+94111234567',
        email: 'colombo@citypharmacy.com',
        operatingHours: { open: '00:00', close: '00:00' },
        pharmacistName: 'Dr. E. Wickramasinghe',
        isActive: true,
        address: 'No. 100, Galle Road, Colombo 03'
      }
    ];

    // Insert sample pharmacies
    const insertedPharmacies = await Pharmacy.insertMany(samplePharmacies);
    console.log(`✅ Successfully inserted ${insertedPharmacies.length} sample pharmacies:`);
    insertedPharmacies.forEach(p => {
      console.log(`  - ${p.name} (${p.district})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addSamplePharmacies();
