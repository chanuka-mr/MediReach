const mongoose = require('mongoose');
const MedicationRequest = require('./Model/MedicationRequest');
const fs = require('fs');
require('dotenv').config();

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await MedicationRequest.find().sort({ createdAt: -1 });
        let out = `Found ${orders.length} orders\n`;
        orders.forEach(o => {
            out += `ID: ${o._id}, Patient: ${o.patient_id}, Pharmacy: ${o.pharmacy_id}\n`;
        });
        fs.writeFileSync('orders_result.txt', out);
        process.exit();
    } catch (error) {
        fs.writeFileSync('orders_result.txt', error.stack);
        process.exit(1);
    }
};

checkOrders();
