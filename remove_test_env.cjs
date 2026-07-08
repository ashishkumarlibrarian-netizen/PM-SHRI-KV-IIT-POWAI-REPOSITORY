const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/app\.get\("\/api\/test-env".*?\}\);/s, '');
fs.writeFileSync('server.ts', code);
