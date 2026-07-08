const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace('const handleError = (res: any, error: any, msg: string) => { return res.status(500).json({ error: msg, details: error }); console.error("SUPABASE_ERROR", JSON.stringify(error));  console.error(msg, error);  res.status(500).json({ error: msg });', 'const handleError = (res: any, error: any, msg: string) => { return res.status(500).json({ error: msg, supabaseUrl: process.env.VITE_SUPABASE_URL }); };');
fs.writeFileSync('server.ts', code);
