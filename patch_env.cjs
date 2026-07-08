const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
const checkEnv = `
app.get("/api/test-env", (req, res) => {
  res.json({ url: supabaseUrl, key: supabaseKey });
});
`;
code = code.replace('// VITE SERVER', checkEnv + '\n// VITE SERVER');
fs.writeFileSync('server.ts', code);
