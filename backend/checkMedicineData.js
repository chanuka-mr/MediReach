const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medireach')
  .then(async () => {
    const MedicationRequest = require('./Model/MedicationRequest');
    const requests = await MedicationRequest.find({}).limit(5);
    console.log('Sample MedicationRequest data:');
    requests.forEach((req, i) => {
      console.log(`${i+1}. Notes: '${req.notes}'`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Pharmacy: ${req.pharmacy_id}`);
      console.log(`   Patient: ${req.patient_id}`);
      console.log('---');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
