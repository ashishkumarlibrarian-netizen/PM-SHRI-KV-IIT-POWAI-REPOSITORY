const fs = require('fs');
let code = fs.readFileSync('src/components/AdminTab.tsx', 'utf8');

if (!code.includes('const [newIsActive')) {
  code = code.replace(
    'const [newAuthor, setNewAuthor] = useState("");',
    'const [newAuthor, setNewAuthor] = useState("");\n  const [newIsActive, setNewIsActive] = useState(false);'
  );
  
  code = code.replace(
    'body: JSON.stringify({ title: newTitle, thought: newThought, author: newAuthor })',
    'body: JSON.stringify({ title: newTitle, thought: newThought, author: newAuthor, is_active: newIsActive })'
  );
  
  code = code.replace(
    'setNewTitle(""); setNewThought(""); setNewAuthor("");',
    'setNewTitle(""); setNewThought(""); setNewAuthor(""); setNewIsActive(false);'
  );
  
  code = code.replace(
    '<input type="checkbox" checked={newTitle === "ACTIVATE_ME" /* just a hack to not add state, let\'s use a ref or add state */} id="make_active" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />',
    '<input type="checkbox" checked={newIsActive} onChange={(e) => setNewIsActive(e.target.checked)} id="make_active" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />'
  );
  
  fs.writeFileSync('src/components/AdminTab.tsx', code);
}
