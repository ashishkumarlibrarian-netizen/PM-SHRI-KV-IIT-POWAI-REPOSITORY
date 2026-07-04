const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileTab.tsx', 'utf8');

code = code.replace(
  'Authorization: `Bearer ${currentUser?.token}`,',
  'Authorization: `Bearer ${localStorage.getItem("kv_library_token")}`,'
);

fs.writeFileSync('src/components/ProfileTab.tsx', code);
