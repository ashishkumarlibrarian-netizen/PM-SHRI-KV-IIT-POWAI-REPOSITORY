const http = require('http');

const req = http.request('http://localhost:3000/api/admin/library-achievers', {
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
  category_id: "00000000-0000-0000-0000-000000000000",
  name: "Test Achiever",
  designation: "Test",
  achievement_title: "Title",
  description: "Desc",
  achievement_date: "", // <-- Let's test this
  academic_year: "2026",
  display_order: 0,
  is_active: true
}));
req.end();
