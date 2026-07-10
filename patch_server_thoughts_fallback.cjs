const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `let memoryThoughts: any[] = [];

// --- THOUGHTS ---
app.get("/api/thoughts/all", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('thoughts').select('*').order('created_at', { ascending: false });
    if (error) {
      if (error.code === 'PGRST205') return res.json(memoryThoughts);
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
      if (error.code === 'PGRST205') {
        const activeMemory = memoryThoughts.find(t => t.is_active) || memoryThoughts[0];
        return res.json(activeMemory ? [activeMemory] : []);
      }
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
  const newThought = { id: crypto.randomUUID(), title, thought, author, is_active: is_active || false, created_at: new Date().toISOString() };
  
  if (is_active) {
    // Deactivate others
    await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {});
  }
  
  const { data, error } = await supabase.from('thoughts').insert(newThought).select().single();
  if (error) {
    if (error.code === 'PGRST205') {
       if (is_active) memoryThoughts.forEach(t => t.is_active = false);
       memoryThoughts.unshift(newThought);
       return res.json(newThought);
    }
    return handleError(res, error, "Failed to add thought");
  }
  res.json(data);
}));

app.put("/api/thoughts/:id", asyncHandler(async (req, res, next) => {
  const { title, thought, author, is_active } = req.body;
  
  if (is_active) {
    // Deactivate others
    await supabase.from('thoughts').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000').catch(() => {});
  }
  
  const { data, error } = await supabase.from('thoughts').update({ title, thought, author, is_active }).eq('id', req.params.id).select().single();
  if (error) {
    if (error.code === 'PGRST205') {
      if (is_active) memoryThoughts.forEach(t => t.is_active = false);
      const idx = memoryThoughts.findIndex(t => t.id === req.params.id);
      if (idx !== -1) {
        memoryThoughts[idx] = { ...memoryThoughts[idx], title, thought, author, is_active };
        return res.json(memoryThoughts[idx]);
      }
      return res.status(404).json({ error: "Not found" });
    }
    return handleError(res, error, "Failed to update thought");
  }
  res.json(data);
}));

app.delete("/api/thoughts/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('thoughts').delete().eq('id', req.params.id);
  if (error) {
    if (error.code === 'PGRST205') {
       memoryThoughts = memoryThoughts.filter(t => t.id !== req.params.id);
       return res.json({ success: true });
    }
    return handleError(res, error, "Failed to delete thought");
  }
  res.json({ success: true });
}));`;

// Remove the old thoughts block entirely
const startMarker = '// --- THOUGHTS ---';
const endMarker = '// --- ADMIN ROUTES ---';

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  code = code.substring(0, startIdx) + replacement + '\n\n' + code.substring(endIdx);
  fs.writeFileSync('server.ts', code);
}
