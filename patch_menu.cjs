const fs = require('fs');
let code = fs.readFileSync('src/components/MenuTab.tsx', 'utf8');

code = code.replace(
  'url: "https://ndl.iitkgp.ac.in/"',
  'url: "https://ndl.education.gov.in/home"'
);

fs.writeFileSync('src/components/MenuTab.tsx', code);
