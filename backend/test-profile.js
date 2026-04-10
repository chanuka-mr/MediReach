require('dotenv').config();
const jwt = require('jsonwebtoken');

async function testProfileUpdate() {
    try {
        console.log('Testing profile update with valid data...');
        console.log('JWT_SECRET loaded:', process.env.JWT_SECRET ? 'Yes' : 'No');
        
        // Create a test token (using a known user ID)
        const testUserId = '69c62d11d6519e0fbed7ca8c'; // From the logs
        const token = jwt.sign({ id: testUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        // Test payload without gender field (should work now)
        const testPayload = {
            name: 'Test User Updated',
            email: 'test@example.com',
            contactNumber: '+94700000000',
            addresses: []
            // Note: gender field is not included when empty
        };
        
        console.log('Sending test request...');
        console.log('Payload:', JSON.stringify(testPayload, null, 2));
        
        const response = await fetch('http://localhost:5000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testPayload)
        });
        
        const data = await response.json();
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (response.status === 200) {
            console.log('SUCCESS: Profile update working correctly!');
        } else {
            console.log('FAILED: Profile update still has issues');
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testProfileUpdate();
