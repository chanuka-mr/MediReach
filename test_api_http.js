const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/roms/pharmacy-tasks?pharmacy_id=ALL',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Body length:', data.length);
    try {
      const orders = JSON.parse(data);
      console.log('Number of orders:', orders.length);
      if (orders.length > 0) {
        console.log('Last order ID:', orders[0]._id);
        console.log('Last order Pharmacy:', orders[0].pharmacy_id);
      }
    } catch (e) {
      console.log('Parse error');
    }
  });
});

req.on('error', error => {
  console.error('Error:', error.message);
});

req.end();
