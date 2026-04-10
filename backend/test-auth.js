const jwt = require('jsonwebtoken');
const User = require('./Models/userModel');

async function testAuth() {
    try {
        console.log('Testing authentication...');
        
        // Check if we can find a user in the database
        const users = await User.find().limit(1);
        if (users.length === 0) {
            console.log('No users found in database');
            return;
        }
        
        const user = users[0];
        console.log('Found user:', user._id, user.email);
        
        // Create a test token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Created test token:', token.substring(0, 50) + '...');
        
        // Test the profile endpoint with this token
        const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Profile response status:', response.status);
        console.log('Profile response data:', data);
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testAuth();
