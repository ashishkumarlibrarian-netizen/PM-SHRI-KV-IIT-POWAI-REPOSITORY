const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldThoughts = `// --- THOUGHTS ---
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
}));`;

const newThoughts = `// --- THOUGHTS ---
app.get("/api/thoughts/all", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('thoughts').select('*').order('created_at', { ascending: false });
    if (error) {
      if (error.code === 'PGRST205') return res.json([]);
      return handleError(res, error, "Failed to get thoughts");
    }
    res.json(data || []);
  } catch (err) {
    handleError(res, err, "Server error");
  }
}));

app.get("/api/thoughts", asyncHandler(async (req, res, next) => {
  try {
    // First try to get the active one
    let { data, error } = await supabase.from('thoughts').select('*').eq('is_active', true).limit(1);
    
    if (error) {
      if (error.code === 'PGRST205') return res.json([]);
      // Maybe column doesn't exist yet, fallback to latest
      if (error.code === 'PGRST206') {
        const fallback = await supabase.from('thoughts').select('*').order('created_at', { ascending: false }).limit(1);
        return res.json(fallback.data || []);
      }
      return handleError(res, error, "Failed to get thoughts");
    }
    
    // If no active thought is found, fallback to latest
    if (!data || data.length === 0) {
       const fallback = await supabase.from('thoughts').select('*').order('created_at', { ascending: false }).limit(1);
       if (!fallback.error) {
         data = fallback.data;
       }
    }
    
    res.json(data || []);
  } catch (err) {
    handleError(res, err, "Server error");
  }
}));

app.post("/api/thoughts", asyncHandler(async (req, res, next) => {
  const { title, thought, author, is_active } = req.body;
  const newThought = { title, thought, author, is_active: is_active || false, created_at: new Date().toISOString() };
  
  if (is_active) {
    // Deactivate others
    await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // update all
  }
  
  const { data, error } = await supabase.from('thoughts').insert(newThought).select().single();
  if (error) {
    if (error.code === 'PGRST205') return handleError(res, error, "Table not found");
    return handleError(res, error, "Failed to add thought");
  }
  res.json(data);
}));

app.put("/api/thoughts/:id", asyncHandler(async (req, res, next) => {
  const { title, thought, author, is_active } = req.body;
  
  if (is_active) {
    // Deactivate others
    await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');
  }
  
  const { data, error } = await supabase.from('thoughts').update({ title, thought, author, is_active }).eq('id', req.params.id).select().single();
  if (error) return handleError(res, error, "Failed to update thought");
  res.json(data);
}));

app.delete("/api/thoughts/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('thoughts').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete thought");
  res.json({ success: true });
}));`;

code = code.replace(oldThoughts, newThoughts);
fs.writeFileSync('server.ts', code);
