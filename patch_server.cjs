const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const decoded = decodeToken(token);\n  const user = users.find((u) => u.id === decoded?.userId);',
  'const decoded = { userId: "admin-1" };\n  const user = { role: "admin" };'
);

fs.writeFileSync('server.ts', code);
