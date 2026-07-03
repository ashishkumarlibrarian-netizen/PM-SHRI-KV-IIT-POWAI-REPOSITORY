const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const filteredVar = `
  const filteredPosts = reviewFilter ? socialPosts.filter(p => p.rating === reviewFilter) : socialPosts;
`;

code = code.replace(
  'const filteredPosts =', 
  filteredVar
);
if (!code.includes(filteredVar)) {
  code = code.replace(
    'return (',
    filteredVar + '\n  return ('
  );
}

// I need to change socialPosts.map inside the render to filteredPosts.map
code = code.replace(
  'socialPosts.map((post) => {',
  'filteredPosts.map((post) => {'
);
// wait, we also have socialPosts.length === 0 but what if filteredPosts.length === 0?
code = code.replace(
  '{socialPosts.length === 0 ? (',
  '{filteredPosts.length === 0 ? ('
);

fs.writeFileSync('src/App.tsx', code);
