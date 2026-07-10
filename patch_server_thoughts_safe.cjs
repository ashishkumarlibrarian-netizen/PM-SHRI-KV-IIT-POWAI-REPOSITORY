const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const s1_old = `const { title, thought, author, is_active } = req.body;
  const newThought = { id: crypto.randomUUID(), title, thought, author, is_active: is_active || false, created_at: new Date().toISOString() };`;
const s1_new = `const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  const newThought = { id: crypto.randomUUID(), title, thought, author, is_active: is_active || false, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order, created_at: new Date().toISOString() };`;

const s2_old = `const { title, thought, author, is_active } = req.body;
  
  if (is_active) {`;
const s2_new = `const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  
  if (is_active) {`;

const s3_old = `await supabase.from('thoughts').update({ title, thought, author, is_active }).eq`;
const s3_new = `await supabase.from('thoughts').update({ title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order }).eq`;

const s4_old = `memoryThoughts[idx] = { ...memoryThoughts[idx], title, thought, author, is_active };`;
const s4_new = `memoryThoughts[idx] = { ...memoryThoughts[idx], title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order };`;

code = code.split(s1_old).join(s1_new);
code = code.split(s2_old).join(s2_new);
code = code.split(s3_old).join(s3_new);
code = code.split(s4_old).join(s4_new);

fs.writeFileSync('server.ts', code);
