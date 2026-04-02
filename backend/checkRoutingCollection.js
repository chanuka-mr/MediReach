const mongoose = require('mongoose');
const RequestRouting = require('./Model/RequestRouting');

async function checkRoutingCollection() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/medireach');
        
        console.log('Connected to MongoDB');
        
        // Check all RequestRouting records
        const routingRecords = await RequestRouting.find({});
        console.log('Total RequestRouting records:', routingRecords.length);
        
        if (routingRecords.length > 0) {
            routingRecords.forEach(record => {
                console.log('Record:', {
                    request_id: record.request_id,
                    pharmacy_id: record.pharmacy_id,
                    route_status: record.route_status,
                    createdAt: record.createdAt
                });
            });
        } else {
            console.log('No RequestRouting records found');
        }
        
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRoutingCollection();
