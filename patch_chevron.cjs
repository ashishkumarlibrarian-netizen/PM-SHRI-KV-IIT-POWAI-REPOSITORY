const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "{'dropdown' in tab && <ChevronDown,\n    Wrench className",
  "{'dropdown' in tab && <ChevronDown className"
);

code = code.replace(
  "{'dropdown' in tab && <ChevronDown,\n    Wrench className",
  "{'dropdown' in tab && <ChevronDown className"
);

fs.writeFileSync('src/App.tsx', code);
