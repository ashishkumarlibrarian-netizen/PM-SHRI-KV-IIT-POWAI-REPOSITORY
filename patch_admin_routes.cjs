const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('/api/admin/avatars')) {
  const newRoutes = `
// --- ADMIN ROUTES ---
app.get("/api/admin/avatars", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabaseAdmin.storage.from('profiles').list();
  if (error) return handleError(res, error, "Failed to list avatars");
  res.json(data || []);
}));

app.delete("/api/admin/avatars/:file", asyncHandler(async (req, res, next) => {
  const { error } = await supabaseAdmin.storage.from('profiles').remove([req.params.file]);
  if (error) return handleError(res, error, "Failed to delete avatar");
  res.json({ success: true });
}));

app.get("/api/admin/storage", asyncHandler(async (req, res, next) => {
  // Simple summary
  const { data, error } = await supabaseAdmin.storage.from('profiles').list();
  if (error) return res.json({ usage: 0 });
  const usage = (data || []).reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
  res.json({ usage });
}));

// --- AUTH & USERS ---`;

  code = code.replace('// --- AUTH & USERS ---', newRoutes);
  fs.writeFileSync('server.ts', code);
}
