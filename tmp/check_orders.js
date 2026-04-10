const mongoose = require('mongoose');
const MedicationRequest = require('./backend/Model/MedicationRequest');
require('dotenv').config({ path: './backend/.env' });

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        const orders = await MedicationRequest.find().sort({ createdAt: -1 }).limit(10);
        console.log('Last 10 orders:');
        orders.forEach(o => {
            console.log(`ID: ${o._id}, Patient: ${o.patient_id}, Pharmacy: ${o.pharmacy_id}, Status: ${o.status}, CreatedAt: ${o.createdAt}`);
        });
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkOrders();
