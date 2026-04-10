const axios = require('axios');

async function testApi() {
  try {
    // Test 1: Get orders
    console.log('📋 Testing GET /api/roms/pharmacy-tasks...');
    const ordersResponse = await axios.get('http://localhost:5000/api/roms/pharmacy-tasks');
    console.log('✅ Orders fetched:', ordersResponse.data.length, 'orders');
    
    if (ordersResponse.data.length > 0) {
      const testOrder = ordersResponse.data[0];
      console.log('🎯 Testing with order:', testOrder._id);
      
      // Test 2: Test dispatch action
      console.log('🚚 Testing dispatch action...');
      try {
        const dispatchResponse = await axios.put(`http://localhost:5000/api/roms/${testOrder._id}/process`, {
          action: 'dispatch',
          pharmacy_id: testOrder.pharmacy_id || 'test-pharmacy',
          notes: 'Test dispatch from API test'
        });
        console.log('✅ Dispatch successful:', dispatchResponse.data.status);
      } catch (dispatchError) {
        console.error('❌ Dispatch failed:', dispatchError.response?.data || dispatchError.message);
      }
      
      // Test 3: Test accept action
      console.log('✅ Testing accept action...');
      try {
        const acceptResponse = await axios.put(`http://localhost:5000/api/roms/${testOrder._id}/process`, {
          action: 'accept',
          pharmacy_id: testOrder.pharmacy_id || 'test-pharmacy'
        });
        console.log('✅ Accept successful (no status change expected)');
      } catch (acceptError) {
        console.error('❌ Accept failed:', acceptError.response?.data || acceptError.message);
      }
      
      // Test 4: Test reject action
      console.log('❌ Testing reject action...');
      try {
        const rejectResponse = await axios.put(`http://localhost:5000/api/roms/${testOrder._id}/process`, {
          action: 'Reject',
          pharmacy_id: testOrder.pharmacy_id || 'test-pharmacy',
          rejectionReason: 'Test rejection from API test'
        });
        console.log('✅ Reject successful:', rejectResponse.data.status);
      } catch (rejectError) {
        console.error('❌ Reject failed:', rejectError.response?.data || rejectError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testApi();
