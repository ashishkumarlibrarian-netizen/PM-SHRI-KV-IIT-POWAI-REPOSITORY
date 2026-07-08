const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const globalHandler = `
// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});
`;

// Insert before // VITE SERVER
code = code.replace('// VITE SERVER', globalHandler + '\n// VITE SERVER');
fs.writeFileSync('server.ts', code);
