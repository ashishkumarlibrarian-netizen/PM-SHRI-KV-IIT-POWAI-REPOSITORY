const http = require('http');

const req = http.request('http://localhost:3000/api/admin/library-achievers/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(res.statusCode, data));
});

req.write(JSON.stringify({
  name: "Test Cat",
  description: "Test Desc",
  icon: "Award",
  display_order: 0,
  is_active: true
}));
req.end();
