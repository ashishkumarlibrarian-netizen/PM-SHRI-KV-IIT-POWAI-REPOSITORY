const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const helpers = `
const STAFF_FILE = path.join(process.cwd(), "data", "staff.json");

const defaultStaff = {
  staffMembers: [
    {
      id: "1",
      name: "Ashish Kumar",
      role: "Librarian & Senior IT Head",
      contribution: "Spearheaded the digital library initiative and cultivated a thriving reading culture among students.",
      avatarColor: "bg-indigo-100 text-indigo-700",
      years: "25+ Years",
      image: "/ashish-kumar.jpeg"
    }
  ],
  editorialTeam: [
    {
      id: "e1",
      name: "Editorial Member",
      role: "Editor-in-Chief",
      contribution: "Leads the curation and editing of the library magazine.",
      avatarColor: "bg-emerald-100 text-emerald-700",
      years: "1+ Years",
      image: ""
    }
  ]
};

function readStaff() {
  if (fs.existsSync(STAFF_FILE)) {
    return JSON.parse(fs.readFileSync(STAFF_FILE, "utf-8"));
  }
  return defaultStaff;
}

function writeStaff(data: any) {
  fs.writeFileSync(STAFF_FILE, JSON.stringify(data, null, 2));
}
`;

if (!code.includes('STAFF_FILE')) {
  code = code.replace(
    'const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");',
    'const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");\n' + helpers
  );
}

const routes = `
app.get("/api/settings/staff", (req, res) => {
  try {
    res.json(readStaff());
  } catch (err) {
    res.status(500).json({ error: "Failed to read staff data" });
  }
});

app.put("/api/settings/staff", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || (user.role !== "admin" && user.fullName !== "Ashish Kumar")) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const newStaffData = req.body;
    writeStaff(newStaffData);
    res.json(newStaffData);
  } catch (err) {
    res.status(500).json({ error: "Failed to update staff data" });
  }
});
`;

if (!code.includes('/api/settings/staff')) {
  code = code.replace(
    'app.get("/api/health"',
    routes + '\napp.get("/api/health"'
  );
}

fs.writeFileSync('server.ts', code);
