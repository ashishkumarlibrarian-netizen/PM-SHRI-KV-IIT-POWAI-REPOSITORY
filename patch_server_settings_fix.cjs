const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const badCode = `
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find((u) => u.id === decoded.userId);
`;

const goodCode = `
    const session = sessions.get(token);
    if (!session || session.expires < Date.now()) {
      if (session) sessions.delete(token); // clean up expired
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    const user = users.find(u => u.id === session.userId);
`;

code = code.replace(badCode, goodCode);
fs.writeFileSync('server.ts', code);
