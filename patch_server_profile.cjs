const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const profileCode = `
app.put("/api/user/profile", (req, res) => {
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
  const userIndex = users.findIndex(u => u.id === session.userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  const { fullName, password, avatarUrl } = req.body;
  
  if (fullName) users[userIndex].fullName = fullName;
  if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl;
  if (password) users[userIndex].passwordHash = password; // simplistic for this exercise

  writeUsers(users);
  
  const updatedUser = users[userIndex];
  res.json({
    id: updatedUser.id,
    email: updatedUser.email,
    fullName: updatedUser.fullName,
    role: updatedUser.role,
    className: updatedUser.className,
    avatarUrl: updatedUser.avatarUrl
  });
});
`;

code = code.replace(
  'app.get("/api/settings/library"',
  profileCode + '\napp.get("/api/settings/library"'
);

fs.writeFileSync('server.ts', code);
