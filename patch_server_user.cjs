const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'role?: string;',
  'role?: string;\n  avatarUrl?: string;'
);

fs.writeFileSync('server.ts', code);
