const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const s1 = `const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  const newThought = { id: crypto.randomUUID(), title, thought, author, is_active: is_active || false, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order, created_at: new Date().toISOString() };`;

const s2 = `const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  
  if (is_active) {`;

const s3 = `await supabase.from('thoughts').update({ title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order }).eq`;

const s4 = `memoryThoughts[idx] = { ...memoryThoughts[idx], title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order };`;

console.log("Original length:", code.length);
code = code.split(s1).join('');
code = code.split(s2).join('');
code = code.split(s3).join('');
code = code.split(s4).join('');

console.log("Restored length:", code.length);
fs.writeFileSync('server_restored.ts', code);
