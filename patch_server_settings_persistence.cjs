const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `
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
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    if (session) sessions.delete(token); // clean up expired
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const users = readUsers();
  const user = users.find(u => u.id === session.userId);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  const { logoUrl, name, tag } = req.body;
  if (logoUrl !== undefined) librarySettings.logoUrl = logoUrl;
  if (name !== undefined) librarySettings.name = name;
  if (tag !== undefined) librarySettings.tag = tag;
  res.json(librarySettings);
});
`;

const newCode = `
const defaultLibrarySettings = {
  logoUrl: "",
  name: "PM Shri Kendriya Vidyalaya",
  tag: "IIT Powai Library"
};

app.get("/api/settings/library", (req, res) => {
  try {
    const settings = readSettings();
    res.json(settings.library || defaultLibrarySettings);
  } catch (err) {
    res.status(500).json({ error: "Failed to load library settings" });
  }
});

app.put("/api/settings/library", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    if (session) sessions.delete(token); // clean up expired
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const users = readUsers();
  const user = users.find(u => u.id === session.userId);

  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  try {
    const settings = readSettings();
    const librarySettings = settings.library || { ...defaultLibrarySettings };
    
    const { logoUrl, name, tag } = req.body;
    if (logoUrl !== undefined) librarySettings.logoUrl = logoUrl;
    if (name !== undefined) librarySettings.name = name;
    if (tag !== undefined) librarySettings.tag = tag;
    
    settings.library = librarySettings;
    writeSettings(settings);
    res.json(librarySettings);
  } catch (err) {
    res.status(500).json({ error: "Failed to save library settings" });
  }
});
`;

code = code.replace(oldCode.trim(), newCode.trim());
fs.writeFileSync('server.ts', code);
