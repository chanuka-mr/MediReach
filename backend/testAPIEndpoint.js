const http = require('http');

// Test the API endpoint with pharmacy name
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/roms/pharmacy-tasks?pharmacy_id=Gampaha%20Pharmacy',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log(`\n✅ Success! Found ${jsonData.length} orders`);
      if (jsonData.length > 0) {
        console.log('\n📋 Sample Order:');
        console.log(`  Pharmacy: ${jsonData[0].pharmacy_id}`);
        console.log(`  Status: ${jsonData[0].status}`);
        console.log(`  Patient: ${jsonData[0].patient_id}`);
      }
    } catch (error) {
      console.log(`\n❌ Error parsing JSON: ${error.message}`);
      console.log(`Raw response: ${data}`);
    }
  });
});

req.on('error', (error) => {
  console.error(`❌ Request Error: ${error.message}`);
});

req.end();
