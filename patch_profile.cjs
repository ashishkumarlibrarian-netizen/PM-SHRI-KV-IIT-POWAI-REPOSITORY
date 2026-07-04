const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileTab.tsx', 'utf8');

code = code.replace(
  'Authorization: \\`Bearer \\${currentUser?.token}\\`,',
  'Authorization: `Bearer ${currentUser?.token}`,'
);
code = code.replace(
  'className={\\`p-4',
  'className={`p-4'
);
code = code.replace(
  '-red-200"}\\`}>',
  '-red-200"}`}>'
);


fs.writeFileSync('src/components/ProfileTab.tsx', code);
