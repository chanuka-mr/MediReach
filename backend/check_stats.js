const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
require('dotenv').config();

const checkStats = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await MedicationRequest.countDocuments();
        const pendingCount = await MedicationRequest.countDocuments({ status: 'Pending' });
        const pharmacies = await MedicationRequest.distinct('pharmacy_id');
        
        console.log(`Total Orders: ${count}`);
        console.log(`Pending Orders: ${pendingCount}`);
        console.log(`Unique Pharmacies:`, pharmacies);
        
        const lastOrder = await MedicationRequest.findOne().sort({ createdAt: -1 });
        console.log(`Latest Order ID: ${lastOrder._id}, Pharmacy: ${lastOrder.pharmacy_id}, CreatedAt: ${lastOrder.createdAt}`);
        
        process.exit();
    } catch (error) {
        process.exit(1);
    }
};

checkStats();
