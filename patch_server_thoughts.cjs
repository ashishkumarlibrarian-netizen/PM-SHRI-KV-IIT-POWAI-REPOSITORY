const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('/api/thoughts')) {
  const newRoutes = `
// --- THOUGHTS ---
app.get("/api/thoughts", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('thoughts').select('*').order('created_at', { ascending: false }).limit(1);
    if (error) {
      if (error.code === 'PGRST205') return res.json([]);
      return handleError(res, error, "Failed to get thoughts");
    }
    res.json(data || []);
  } catch (err) {
    handleError(res, err, "Server error");
  }
}));

app.post("/api/thoughts", asyncHandler(async (req, res, next) => {
  const { title, thought, author } = req.body;
  const newThought = { title, thought, author, created_at: new Date().toISOString() };
  
  // We only keep one active thought, so we could delete existing ones or just insert and limit 1.
  // We will just insert, and the frontend only fetches the latest.
  const { data, error } = await supabase.from('thoughts').insert(newThought).select().single();
  if (error) {
    if (error.code === 'PGRST205') return handleError(res, error, "Table not found");
    return handleError(res, error, "Failed to add thought");
  }
  res.json(data);
}));

app.put("/api/thoughts/:id", asyncHandler(async (req, res, next) => {
  const { title, thought, author } = req.body;
  const { data, error } = await supabase.from('thoughts').update({ title, thought, author }).eq('id', req.params.id).select().single();
  if (error) return handleError(res, error, "Failed to update thought");
  res.json(data);
}));

app.delete("/api/thoughts/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('thoughts').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete thought");
  res.json({ success: true });
}));

// --- AUTH & USERS ---`;

  code = code.replace('// --- AUTH & USERS ---', newRoutes);
  fs.writeFileSync('server.ts', code);
}
