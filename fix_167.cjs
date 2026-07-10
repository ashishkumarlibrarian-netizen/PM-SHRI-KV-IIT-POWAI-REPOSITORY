const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(
  'app.post("/api/thoughts", asyncHandler(async (req, res, next) => {\n  || false, created_at: new Date().toISOString() };',
  'app.post("/api/thoughts", asyncHandler(async (req, res, next) => {\n  const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;\n  const newThought = { id: crypto.randomUUID(), title, thought, author, is_active: is_active || false, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order, created_at: new Date().toISOString() };'
);
fs.writeFileSync('server.ts', code);
