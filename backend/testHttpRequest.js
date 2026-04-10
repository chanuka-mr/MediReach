// Test HTTP request to API
const testHttpRequest = async () => {
  try {
    const testData = {
      patient_id: 'PAT-TEST-003',
      pharmacy_id: 'Gampaha Pharmacy',
      priority_level: 'Normal',
      notes: 'Test via Node.js HTTP',
      medicines: JSON.stringify([{
        medicine_id: '507f1f77bcf86cd799439011',
        medicine_name: 'Paracetamol 500mg',
        quantity: 1,
        unit_price: 120,
        total_price: 120
      }])
    };

    console.log('📋 Testing HTTP request...');
    console.log('Data to send:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:5000/api/roms/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('\n✅ HTTP request successful!');
    console.log('Order created:', result._id);
    console.log('Medicines in order:', result.medicines?.length || 0);

  } catch (error) {
    console.error('❌ HTTP request error:', error.message);
  }
};

testHttpRequest();
