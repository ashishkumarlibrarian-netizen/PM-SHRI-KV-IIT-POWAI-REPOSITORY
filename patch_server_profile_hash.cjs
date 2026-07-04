const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldProfileUpdate = `  const { fullName, password, avatarUrl } = req.body;
  
  if (fullName) users[userIndex].fullName = fullName;
  if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl;
  if (password) users[userIndex].passwordHash = password; // simplistic for this exercise

  writeUsers(users);`;

const newProfileUpdate = `  const { fullName, password, avatarUrl } = req.body;
  
  if (fullName) users[userIndex].fullName = fullName;
  if (avatarUrl !== undefined) users[userIndex].avatarUrl = avatarUrl;
  if (password) users[userIndex].passwordHash = hashPassword(password); // hashed

  writeUsers(users);`;

code = code.replace(oldProfileUpdate, newProfileUpdate);
fs.writeFileSync('server.ts', code);
