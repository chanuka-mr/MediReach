const axios = require('axios');

const testFlow = async () => {
    try {
        const patientId = 'TEST-' + Date.now();
        const pharmacyId = 'PHARM-001';
        
        console.log('1. Submitting new order...');
        const res1 = await axios.post('http://localhost:5000/api/roms/request', {
            patient_id: patientId,
            pharmacy_id: pharmacyId,
            priority_level: 'Normal',
            expiry_time: new Date(Date.now() + 86400000).toISOString(),
            notes: 'Test Order'
        });
        console.log('Order created:', res1.data._id);
        
        console.log('2. Fetching dashboard for PHARM-001...');
        const res2 = await axios.get(`http://localhost:5000/api/roms/pharmacy-tasks?pharmacy_id=${pharmacyId}`);
        const found = res2.data.some(o => o.patient_id === patientId);
        console.log('Order found in dashboard list:', found);
        if (!found) {
            console.log('Orders returned:', res2.data.map(o => o.patient_id));
        }
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
};

testFlow();
