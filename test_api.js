const axios = require('axios');

const testApi = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/roms/pharmacy-tasks?pharmacy_id=ALL');
        console.log(`Found ${res.data.length} orders via API`);
        if (res.data.length > 0) {
            console.log('Last order ID:', res.data[0]._id);
            console.log('Last order pharmacy:', res.data[0].pharmacy_id);
        }
    } catch (error) {
        console.error('API Error:', error.message);
    }
};

testApi();
