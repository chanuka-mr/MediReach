const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medireach')
  .then(async () => {
    const MedicationRequest = require('./Model/MedicationRequest');
    const requests = await MedicationRequest.find({}).limit(2);
    console.log('Testing medicine name extraction:');
    requests.forEach((req, i) => {
      const medicineName = req.notes ? req.notes.split(' - ')[0].trim() : 'Unknown Medicine';
      console.log(`Original: '${req.notes}'`);
      console.log(`Extracted: '${medicineName}'`);
      console.log('---');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
