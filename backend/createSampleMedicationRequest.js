const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
const Medicine = require('./Model/medicineModel');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medireach')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get some medicines from the database
    const medicines = await Medicine.find({}).limit(5);
    
    if (medicines.length === 0) {
      console.log('No medicines found. Please add some medicines first.');
      process.exit(0);
    }
    
    console.log('Found medicines:', medicines.map(m => m.mediName));
    
    // Create a sample medication request with medicines
    const sampleRequest = new MedicationRequest({
      patient_id: 'PAT001',
      pharmacy_id: 'Gampaha Pharmacy',
      status: 'Pending',
      priority_level: 'Normal',
      expiry_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: 'Patient needs these medications for treatment',
      prescription_image: 'prescription.jpg',
      medicines: medicines.slice(0, 3).map((medicine, index) => ({
        medicine_id: medicine._id,
        medicine_name: medicine.mediName,
        quantity: (index + 1) * 2, // 2, 4, 6 units
        unit_price: medicine.mediPrice,
        total_price: medicine.mediPrice * ((index + 1) * 2)
      }))
    });
    
    // Save the sample request
    const savedRequest = await sampleRequest.save();
    console.log('Sample medication request created:');
    console.log('- Patient ID:', savedRequest.patient_id);
    console.log('- Pharmacy:', savedRequest.pharmacy_id);
    console.log('- Status:', savedRequest.status);
    console.log('- Medicines:');
    savedRequest.medicines.forEach((med, idx) => {
      console.log(`  ${idx + 1}. ${med.medicine_name} - Qty: ${med.quantity} - Total: LKR ${med.total_price}`);
    });
    
    console.log('\n✅ Sample data created successfully!');
    console.log('You can now view this order in the PharmacyOrders page.');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
