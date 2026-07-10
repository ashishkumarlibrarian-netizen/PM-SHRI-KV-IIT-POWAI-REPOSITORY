const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The file got completely corrupted at the start. Wait, was the whole file corrupted or just the top?
