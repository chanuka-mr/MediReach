const mongoose = require('mongoose');
const User = require('./Models/userModel');
require('dotenv').config();

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'admin@medireach.com' });
    
    if (!existingUser) {
      console.log('Creating test user...');
      const testUser = await User.create({
        name: 'Admin User',
        email: 'admin@medireach.com',
        password: 'admin123',
        role: 'admin',
        contactNumber: '+94771234567'
      });
      console.log('Test user created:', testUser.email);
    } else {
      console.log('Test user already exists:', existingUser.email);
    }

    // Test login
    const user = await User.findOne({ email: 'admin@medireach.com' });
    if (user && await user.matchPassword('admin123')) {
      console.log('✅ Login test successful!');
      console.log('User:', user.name, 'Role:', user.role);
    } else {
      console.log('❌ Login test failed');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

testLogin();
