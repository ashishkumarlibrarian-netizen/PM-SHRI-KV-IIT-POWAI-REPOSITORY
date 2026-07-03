const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handlesGrid = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pb-2">`;
// Wait, I already changed it to grid-cols-1 md:grid-cols-2 ? 
// Let's check what it currently is.
