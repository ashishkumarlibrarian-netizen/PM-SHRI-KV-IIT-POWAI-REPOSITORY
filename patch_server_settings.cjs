const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const settingsState = `
let librarySettings = {
  logoUrl: "",
  name: "PM Shri Kendriya Vidyalaya",
  tag: "IIT Powai Library"
};

app.get("/api/settings/library", (req, res) => {
  res.json(librarySettings);
});

app.put("/api/settings/library", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = users.find((u) => u.id === decoded.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const { logoUrl, name, tag } = req.body;
    if (logoUrl !== undefined) librarySettings.logoUrl = logoUrl;
    if (name !== undefined) librarySettings.name = name;
    if (tag !== undefined) librarySettings.tag = tag;
    res.json(librarySettings);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});
`;

code = code.replace(
  '// Endpoints for "Library Settings"',
  '// Endpoints for "Library Settings"\n' + settingsState
);
if (!code.includes('app.get("/api/settings/library"')) {
    code = code.replace(
      '// --- API Endpoints ---',
      '// --- API Endpoints ---\n' + settingsState
    );
}

fs.writeFileSync('server.ts', code);
