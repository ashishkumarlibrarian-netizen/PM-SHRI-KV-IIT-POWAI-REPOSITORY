const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'PM Shri Kendriya Vidyalaya IIT Powai Sector',
  '{librarySettings.name} {librarySettings.tag}'
);

fs.writeFileSync('src/App.tsx', code);
