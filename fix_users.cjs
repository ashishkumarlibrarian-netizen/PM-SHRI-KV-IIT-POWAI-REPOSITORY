const fs = require('fs');
const crypto = require('crypto');
function hashPassword(password) {
  return crypto.createHmac("sha256", "PM_SHRI_SALT_2026").update(password).digest("hex");
}
let users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'));
const adminIndex = users.findIndex(u => u.email === "ashishkumar.librarian@gmail.com");
if (adminIndex !== -1) {
  users[adminIndex].passwordHash = hashPassword("1234");
  fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2));
}
