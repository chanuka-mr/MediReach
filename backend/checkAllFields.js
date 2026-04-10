const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medireach')
  .then(async () => {
    const MedicationRequest = require('./Model/MedicationRequest');
    const requests = await MedicationRequest.find({}).limit(3);
    console.log('Checking all fields:');
    requests.forEach((req, i) => {
      console.log(`${i+1}. Full object:`, JSON.stringify(req, null, 2));
      console.log('---');
    });
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
