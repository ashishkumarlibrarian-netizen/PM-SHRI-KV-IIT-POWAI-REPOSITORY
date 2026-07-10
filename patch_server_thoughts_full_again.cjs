const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/const { title, thought, author, is_active } = req.body;\n  const newThought = { id: crypto.randomUUID\(\), title, thought, author, is_active: is_active || false, created_at: new Date\(\)\.toISOString\(\) };/g, 
`const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  const newThought = { id: crypto.randomUUID(), title, thought, author, is_active: is_active || false, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order, created_at: new Date().toISOString() };`);

code = code.replace(/const { title, thought, author, is_active } = req.body;\n  \n  if \(is_active\) {/g, 
`const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  
  if (is_active) {`);
  
code = code.replace(/await supabase\.from\('thoughts'\)\.update\({ title, thought, author, is_active }\)\.eq/g, 
`await supabase.from('thoughts').update({ title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order }).eq`);

code = code.replace(/memoryThoughts\[idx\] = { \.\.\.memoryThoughts\[idx\], title, thought, author, is_active };/g, 
`memoryThoughts[idx] = { ...memoryThoughts[idx], title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order };`);

fs.writeFileSync('server.ts', code);
