const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config();

// Fix for ECONNREFUSED when resolving SRV records in some networks
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
        console.log(`Attempting to connect to: ${maskedUri}`);
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
