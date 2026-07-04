const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const badCode = `
  const user = users.find(u => u.id === session.userId);
`;

const goodCode = `
  const users = readUsers();
  const user = users.find(u => u.id === session.userId);
`;

code = code.replace(badCode, goodCode);
fs.writeFileSync('server.ts', code);
