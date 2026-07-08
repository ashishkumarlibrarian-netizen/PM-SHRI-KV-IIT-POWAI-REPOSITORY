const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace('const handleError = (res: any, error: any, msg: string) => {', 'const handleError = (res: any, error: any, msg: string) => { return res.status(500).json({ error: msg, details: error });');
fs.writeFileSync('server.ts', code);
