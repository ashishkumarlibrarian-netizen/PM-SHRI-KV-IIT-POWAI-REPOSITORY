
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const PORT: number = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "50mb" }));

// Initialize Supabase client for backend (using service role to bypass RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(supabaseUrl, supabaseKey);

// Dedicated Service Role client with persistSession disabled to bypass RLS and prevent auth state pollution across requests
const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

// AI Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });

// Dummy session store (can also be moved to Supabase if needed, but simple memory is fine for MVP)
const sessions = new Map();

// Helper to verify admin permissions using the existing session/role architecture
const requireAdmin = async (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
  
  const userId = sessions.get(token);
  const { data: user } = await supabaseAdmin.from('users').select('role').eq('id', userId).single();
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
};

// Helper for sending generic error
const handleError = (res: any, error: any, msg: string) => {
  console.error("SUPABASE_ERROR_DETAILS:", error, "CAUSE:", error?.cause);
  return res.status(500).json({ 
    error: msg, 
    details: error?.message || error, 
    cause: error?.cause?.message || (error?.cause ? String(error.cause) : undefined),
    code: error?.code, 
    hint: error?.hint 
  });
};


// --- QUICK LINKS ---
app.get("/api/quick_links", asyncHandler(async (req: any, res: any) => {
  const { data, error } = await supabase.from('quick_links').select('*').order('display_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

app.post("/api/quick_links", asyncHandler(async (req: any, res: any) => {
  const { title, url, icon, category, display_order, is_active, description, badge, open_new_tab } = req.body;
  const newLink = { 
    title, 
    url, 
    icon, 
    category, 
    display_order: display_order || 0, 
    is_active: is_active ?? true, 
    description: description || null,
    badge: badge || null,
    open_new_tab: open_new_tab ?? true,
    created_at: new Date().toISOString() 
  };
  const { data, error } = await supabase.from('quick_links').insert(newLink).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

app.put("/api/quick_links/:id", asyncHandler(async (req: any, res: any) => {
  const { title, url, icon, category, display_order, is_active, description, badge, open_new_tab } = req.body;
  const { data, error } = await supabase.from('quick_links')
    .update({ 
      title, 
      url, 
      icon, 
      category, 
      display_order, 
      is_active, 
      description: description || null, 
      badge: badge || null, 
      open_new_tab: open_new_tab ?? true 
    })
    .eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}));

app.delete("/api/quick_links/:id", asyncHandler(async (req: any, res: any) => {
  const { error } = await supabase.from('quick_links').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}));

app.put("/api/quick_links_category/rename", asyncHandler(async (req: any, res: any) => {
  const { oldCategory, newCategory } = req.body;
  if (!oldCategory || !newCategory) {
    return res.status(400).json({ error: "oldCategory and newCategory are required" });
  }
  const { data, error } = await supabase.from('quick_links')
    .update({ category: newCategory })
    .eq('category', oldCategory);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
}));

app.delete("/api/quick_links_category/:categoryName", asyncHandler(async (req: any, res: any) => {
  const { categoryName } = req.params;
  const { error } = await supabase.from('quick_links')
    .delete()
    .eq('category', categoryName);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
}));


app.get("/api/setup_db", asyncHandler(async (req: any, res: any) => {
  // Ensure buckets exist
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (buckets && !buckets.find(b => b.name === 'reader-clubs')) {
      await supabaseAdmin.storage.createBucket('reader-clubs', { public: true });
    }
    if (buckets && !buckets.find(b => b.name === 'library-showcase')) {
      await supabaseAdmin.storage.createBucket('library-showcase', { public: true });
    }
    if (buckets && !buckets.find(b => b.name === 'library-achievers')) {
      await supabaseAdmin.storage.createBucket('library-achievers', { public: true });
    }
  } catch (err) {
    console.error("Failed to create bucket", err);
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS public.library_achiever_categories (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      description text,
      icon text,
      display_order integer default 0,
      is_active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    ALTER TABLE public.library_achiever_categories ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public library_achiever_categories access" ON public.library_achiever_categories;
    CREATE POLICY "Public library_achiever_categories access" ON public.library_achiever_categories FOR ALL USING (true);

    CREATE TABLE IF NOT EXISTS public.library_achievers (
      id uuid primary key default gen_random_uuid(),
      category_id uuid references public.library_achiever_categories(id) on delete cascade,
      name text not null,
      designation text,
      achievement_title text,
      description text,
      profile_photo text,
      achievement_date date,
      academic_year text,
      display_order integer default 0,
      is_active boolean default true,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    ALTER TABLE public.library_achievers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public library_achievers access" ON public.library_achievers;
    CREATE POLICY "Public library_achievers access" ON public.library_achievers FOR ALL USING (true);

    CREATE TABLE IF NOT EXISTS public.quick_links (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      url text not null,
      icon text,
      category text,
      display_order integer default 0,
      is_active boolean default true,
      created_at timestamptz default now()
    );
    ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public full access quick_links" ON public.quick_links;
    CREATE POLICY "Public full access quick_links" ON public.quick_links FOR ALL USING (true);
    
    CREATE TABLE IF NOT EXISTS public.library_showcase (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      description text,
      category text,
      author text,
      class_name text,
      cover_image text,
      gallery_images text[],
      video_url text,
      video_type text,
      youtube_url text,
      attachment_url text,
      tags text[],
      likes integer default 0,
      views integer default 0,
      featured boolean default false,
      is_active boolean default true,
      display_order integer default 0,
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    ALTER TABLE public.library_showcase ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public library_showcase access" ON public.library_showcase;
    CREATE POLICY "Public library_showcase access" ON public.library_showcase FOR ALL USING (true);

    CREATE TABLE IF NOT EXISTS public.library_showcase_images (
      id uuid primary key default gen_random_uuid(),
      post_id uuid references public.library_showcase(id) on delete cascade,
      image_url text not null,
      display_order integer default 0,
      created_at timestamptz default now()
    );
    ALTER TABLE public.library_showcase_images ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public library_showcase_images access" ON public.library_showcase_images;
    CREATE POLICY "Public library_showcase_images access" ON public.library_showcase_images FOR ALL USING (true);

    CREATE TABLE IF NOT EXISTS public.library_showcase_likes (
      id uuid primary key default gen_random_uuid(),
      post_id uuid references public.library_showcase(id) on delete cascade,
      identifier text not null,
      created_at timestamptz default now()
    );
    ALTER TABLE public.library_showcase_likes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public library_showcase_likes access" ON public.library_showcase_likes;
    CREATE POLICY "Public library_showcase_likes access" ON public.library_showcase_likes FOR ALL USING (true);

    CREATE TABLE IF NOT EXISTS public.library_showcase_views (
      id uuid primary key default gen_random_uuid(),
      post_id uuid references public.library_showcase(id) on delete cascade,
      identifier text not null,
      viewed_at timestamptz default now()
    );
    ALTER TABLE public.library_showcase_views ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public library_showcase_views access" ON public.library_showcase_views;
    CREATE POLICY "Public library_showcase_views access" ON public.library_showcase_views FOR ALL USING (true);

    ALTER TABLE public.library_posts ADD COLUMN IF NOT EXISTS is_hidden boolean default false;
    ALTER TABLE public.library_posts ADD COLUMN IF NOT EXISTS is_pinned boolean default false;
    ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
    ALTER TABLE public.library_showcase ADD COLUMN IF NOT EXISTS likes integer default 0;
    ALTER TABLE public.library_showcase ADD COLUMN IF NOT EXISTS views integer default 0;

    CREATE TABLE IF NOT EXISTS public.readers_club_folders (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      description text,
      color text,
      logo text,
      cover_image text,
      banner_image text,
      display_order integer default 0,
      is_active boolean default true,
      created_at timestamptz default now()
    );
    ALTER TABLE public.readers_club_folders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public readers_club_folders access" ON public.readers_club_folders;
    CREATE POLICY "Public readers_club_folders access" ON public.readers_club_folders FOR ALL USING (true);
    
    ALTER TABLE public.readers_club_folders ADD COLUMN IF NOT EXISTS description text;
    ALTER TABLE public.readers_club_folders ADD COLUMN IF NOT EXISTS cover_image text;
    ALTER TABLE public.readers_club_folders ADD COLUMN IF NOT EXISTS banner_image text;
    ALTER TABLE public.readers_club_folders ADD COLUMN IF NOT EXISTS display_order integer default 0;
    ALTER TABLE public.readers_club_folders ADD COLUMN IF NOT EXISTS is_active boolean default true;
    
    CREATE TABLE IF NOT EXISTS public.readers_club_members (
      id uuid primary key default gen_random_uuid(),
      folder_id uuid references public.readers_club_folders(id) on delete cascade,
      name text not null,
      role text,
      contribution text,
      grade text,
      avatar_color text,
      image text,
      created_at timestamptz default now()
    );
    ALTER TABLE public.readers_club_members ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public readers_club_members access" ON public.readers_club_members;
    CREATE POLICY "Public readers_club_members access" ON public.readers_club_members FOR ALL USING (true);

    CREATE TABLE IF NOT EXISTS public.readers_club_photos (
      id uuid primary key default gen_random_uuid(),
      folder_id uuid references public.readers_club_folders(id) on delete cascade,
      url text not null,
      display_order integer default 0,
      created_at timestamptz default now()
    );
    ALTER TABLE public.readers_club_photos ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public readers_club_photos access" ON public.readers_club_photos;
    CREATE POLICY "Public readers_club_photos access" ON public.readers_club_photos FOR ALL USING (true);
  `;
  const { data, error } = await supabaseAdmin.rpc('execute_sql', { sql_statement: sql });
  // if execute_sql fails, we can just do raw query or ignore if we don't have rpc
  // Wait, execute_sql might not exist. Let's do it directly or via another way.
  // Actually, we can use `supabase.rest.from` but DDL isn't supported. 
  // Let's just create it.
  res.json({ data, error });
}));


// --- ADMIN AVATARS MANAGER ---
app.get("/api/admin/avatars_extended", asyncHandler(async (req: any, res: any) => {
  // Get all users from users table that have an avatarUrl
  const { data: users, error } = await supabase.from('users').select('id, full_name, avatar_url').not('avatar_url', 'is', null);
  if (error) return res.status(500).json({ error: error.message });
  
  // Format them
  const avatars = (users || []).map((u: any) => ({
    id: u.id,
    studentName: u.full_name || 'Unknown',
    url: u.avatar_url,
    path: u.avatar_url ? (u.avatar_url.includes('/profiles/') ? u.avatar_url.split('/profiles/')[1] : u.avatar_url) : '',
    uploadDate: new Date().toISOString() // We don't have exactly when it was uploaded unless we parse from URL or bucket. We'll just leave it as mock or fetch from bucket.
  }));
  
  res.json(avatars);
}));

app.delete("/api/admin/avatars_extended/:userId", asyncHandler(async (req: any, res: any) => {
  const userId = req.params.userId;
  // Get user
  const { data: user } = await supabase.from('users').select('avatar_url').eq('id', userId).single();
  if (user && user.avatar_url) {
    const path = user.avatar_url.includes('/profiles/') ? user.avatar_url.split('/profiles/')[1] : user.avatar_url;
    if (path) {
      await supabaseAdmin.storage.from('profiles').remove([path]);
    }
  }
  // Clear from DB
  await supabase.from('users').update({ avatar_url: null }).eq('id', userId);
  res.json({ success: true });
}));

// --- FILE UPLOAD ---
app.post("/api/upload", upload.single("file"), asyncHandler(async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const bucket = req.body.bucket || "documents";
  
  const fileExt = req.file.originalname.split('.').pop() || 'jpg';
  let targetFileName = req.body.fileName || `${crypto.randomUUID()}.${fileExt}`;
  
  if (bucket === 'profiles') {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
    const userId = sessions.get(token);
    
    // Try to list existing files and delete them
    try {
      const { data: existingFiles } = await supabaseAdmin.storage.from(bucket).list(userId);
      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(f => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from(bucket).remove(filesToRemove);
      }
    } catch(e) {
      console.warn("Failed to remove old avatars", e);
    }
    
    targetFileName = `${userId}/avatar-${Date.now()}.${fileExt}`;
  }
  
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(targetFileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    });
    
  if (error) {
    console.error(`Upload error for bucket ${bucket}:`, error);
    return res.status(500).json({
      message: error.message,
      error: error.name,
      statusCode: (error as any).statusCode || (error as any).status,
      details: (error as any).details || (error as any).cause,
      hint: (error as any).hint,
      fullError: error
    });
  }
  
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(targetFileName);
    
  const finalUrl = bucket === 'profiles' ? `${publicUrl}?t=${Date.now()}` : publicUrl;

  if (bucket === 'profiles') {
    const token = req.headers.authorization?.split(" ")[1];
    if (token && sessions.has(token)) {
      const userId = sessions.get(token);
      
      // Update public.users table
      try {
        const { error: usersErr } = await supabase
          .from('users')
          .update({ avatar_url: finalUrl })
          .eq('id', userId);
        if (usersErr) {
          console.error("[SERVER] Supabase error updating users avatar_url:", JSON.stringify(usersErr, null, 2));
        }
      } catch (err) {
        console.error("[SERVER] Exception during users table avatar_url update:", err);
      }

      // Update public.library_posts table to sync avatar
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', userId)
          .maybeSingle();
          
        if (dbUser && dbUser.full_name) {
          const { error: postsErr } = await supabase
            .from('library_posts')
            .update({ avatarSeed: finalUrl, photoUrl: finalUrl })
            .eq('studentName', dbUser.full_name);
          if (postsErr) {
            console.error("[SERVER] Supabase error updating library_posts avatar:", JSON.stringify(postsErr, null, 2));
          }
        }
      } catch (err) {
        console.error("[SERVER] Exception during library_posts avatar sync:", err);
      }
    }
  }

  res.json({ publicUrl: finalUrl, fileName: targetFileName, avatarUrl: finalUrl });
}));

app.get("/api/diag-env", (req: any, res: any) => {
  res.json({
    exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    length: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0,
    usingFallback: !process.env.SUPABASE_SERVICE_ROLE_KEY,
    keyPrefix: supabaseKey.substring(0, 20),
    supabaseUrl,
  });
});


let memoryThoughts: any[] = [];

const unpackThought = (t: any) => {
  if (!t) return t;
  let parsed: any = {};
  try {
    if (t.card_color && t.card_color.startsWith("{")) {
      parsed = JSON.parse(t.card_color);
    }
  } catch (e) {
    console.warn("Failed to parse card_color JSON", e);
  }
  return {
    ...t,
    bg_color: parsed.bg_color || t.card_color || "",
    border_color: parsed.border_color || "",
    gradient_start: parsed.gradient_start || "",
    gradient_end: parsed.gradient_end || "",
    is_active: parsed.is_active !== false,
    display_order: parsed.display_order || 0
  };
};

// --- THOUGHTS ---
app.get("/api/thoughts/all", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('thoughts').select('*').order('created_at', { ascending: false });
    if (error) {
      if (error.code === 'PGRST205') return res.json(memoryThoughts.map(unpackThought));
      return handleError(res, error, "Failed to get thoughts");
    }
    const unpacked = (data || []).map(unpackThought);
    res.json(unpacked);
  } catch (err) {
    handleError(res, err, "Server error");
  }
}));

app.get("/api/thoughts", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('thoughts').select('*').order('created_at', { ascending: false }).limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.code === 'PGRST206') {
        const fallback = memoryThoughts[0];
        return res.json(fallback ? [unpackThought(fallback)] : []);
      }
      return handleError(res, error, "Failed to get thoughts");
    }
    const unpacked = (data || []).map(unpackThought);
    res.json(unpacked);
  } catch (err) {
    handleError(res, err, "Server error");
  }
}));

app.post("/api/thoughts", asyncHandler(async (req, res, next) => {
  const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  
  const packedStyle = {
    bg_color,
    border_color,
    gradient_start,
    gradient_end,
    is_active: is_active || false,
    display_order: display_order || 0
  };

  const newThought = { 
    id: crypto.randomUUID(), 
    title, 
    thought, 
    author, 
    card_color: JSON.stringify(packedStyle),
    text_color, 
    icon, 
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase.from('thoughts').insert(newThought).select().single();
  if (error) {
    if (error.code === 'PGRST205') {
       memoryThoughts.unshift(newThought);
       return res.json(unpackThought(newThought));
    }
    return handleError(res, error, "Failed to add thought");
  }
  res.json(unpackThought(data));
}));

app.put("/api/thoughts/:id", asyncHandler(async (req, res, next) => {
  const { title, thought, author, is_active, icon, bg_color, text_color, border_color, gradient_start, gradient_end, display_order } = req.body;
  
  const packedStyle = {
    bg_color,
    border_color,
    gradient_start,
    gradient_end,
    is_active: is_active || false,
    display_order: display_order || 0
  };

  const updatePayload: any = {
    title,
    thought,
    author,
    card_color: JSON.stringify(packedStyle),
    text_color,
    icon,
    updated_at: new Date().toISOString()
  };

  if (is_active) {
    updatePayload.created_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase.from('thoughts').update(updatePayload).eq('id', req.params.id).select().single();
  if (error) {
    if (error.code === 'PGRST205') {
      const idx = memoryThoughts.findIndex(t => t.id === req.params.id);
      if (idx !== -1) {
        memoryThoughts[idx] = { ...memoryThoughts[idx], ...updatePayload };
        return res.json(unpackThought(memoryThoughts[idx]));
      }
      return res.status(404).json({ error: "Not found" });
    }
    return handleError(res, error, "Failed to update thought");
  }
  res.json(unpackThought(data));
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
}));

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

// --- AUTH & USERS ---
app.post("/api/auth/register", asyncHandler(async (req, res, next) => {
  try {
    const { email, username, fullName, className, password } = req.body;
    if (!email || !username || !fullName || !password) return res.status(400).json({ error: "Missing registration fields" });

    // Check if the email exists in public.users to give a clean message
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Create user in Supabase Auth securely (automatically confirmed)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        full_name: fullName,
        class_name: className || ""
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const newUser = {
      id: authData.user.id,
      email,
      username,
      full_name: fullName,
      class_name: className || "",
      role: "student",
      created_at: new Date().toISOString()
    };

    const { error: dbError } = await supabase.from('users').insert(newUser);
    if (dbError) return handleError(res, dbError, "Failed to create user profile");

    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, newUser.id);

    res.json({
      message: "Registered successfully",
      token,
      user: {
        ...newUser,
        fullName: newUser.full_name,
        className: newUser.class_name,
        avatarUrl: ""
      }
    });
  } catch (err) { handleError(res, err, "Server error during registration"); }
}));

app.post("/api/auth/login", asyncHandler(async (req, res, next) => {
  try {
    const { email, usernameOrEmail, password } = req.body;
    const identifier = email || usernameOrEmail;

    if (!identifier) {
      return res.status(400).json({ error: "Please enter your username or email address" });
    }
    if (!password) {
      return res.status(400).json({ error: "Please enter your password" });
    }

    let targetEmail = identifier;

    // Resolve email if username was provided (doesn't contain '@')
    if (!targetEmail.includes("@")) {
      const { data: userProfile, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('username', targetEmail)
        .maybeSingle();

      if (lookupError) {
        return res.status(500).json({ error: "Database error during username lookup", details: lookupError.message });
      }
      if (!userProfile) {
        return res.status(404).json({ error: `Username "${targetEmail}" does not exist` });
      }
      targetEmail = userProfile.email;
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: targetEmail,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({ error: authError?.message || "Invalid email/username or password" });
    }

    // Fetch user profile from public.users table to read role and details
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (dbError) {
      return res.status(500).json({ error: "Database error retrieving user profile", details: dbError.message });
    }

    let finalUser = user;
    if (!finalUser) {
      // Auto-create public profile if missing (self-healing)
      const newUser = {
        id: authData.user.id,
        email: targetEmail,
        username: authData.user.user_metadata?.username || targetEmail.split('@')[0],
        full_name: authData.user.user_metadata?.full_name || "User",
        class_name: authData.user.user_metadata?.class_name || "",
        role: "student",
        created_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase.from('users').insert(newUser);
      if (insertError) {
        return res.status(500).json({ error: "Failed to self-heal missing profile", details: insertError.message });
      }
      
      const { data: createdUser, error: refetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();
        
      if (refetchError || !createdUser) {
        return res.status(500).json({ error: "Failed to retrieve self-healed profile" });
      }
      finalUser = createdUser;
    }

    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, finalUser.id);

    res.json({
      token,
      user: {
        ...finalUser,
        fullName: finalUser.full_name,
        className: finalUser.class_name,
        avatarUrl: finalUser.avatar_url || ""
      }
    });
  } catch (err) { handleError(res, err, "Server error during login"); }
}));

app.get("/api/auth/me", asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
  
  const userId = sessions.get(token);
  const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
  
  if (error || !user) return res.status(401).json({ error: "User not found" });

  let avatarUrl = user.avatar_url || "";
  if (avatarUrl === undefined || !('avatar_url' in user)) {
    // Fallback: fetch from auth metadata
    const { data: { user: authUser }, error: authErr } = await supabase.auth.admin.getUserById(userId);
    if (!authErr && authUser) {
      avatarUrl = authUser.user_metadata?.avatar_url || "";
    }
  }

  res.json({ user: { ...user, avatarUrl, fullName: user.full_name, className: user.class_name } });
}));

app.put("/api/user/profile", asyncHandler(async (req, res, next) => {
  console.log("[SERVER] PUT /api/user/profile - req.body:", JSON.stringify(req.body, null, 2));
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
  
  const userId = sessions.get(token);
  const { fullName, className, avatarUrl, password } = req.body;

  if (password && password.trim() !== "") {
    const { error: pwdError } = await supabase.auth.admin.updateUserById(userId, {
      password: password
    });
    if (pwdError) {
      console.error("[SERVER] Password update failed for user", userId, pwdError);
      return res.status(400).json({ error: "Password update failed: " + pwdError.message });
    }
  }
  
  let updateData: any = {};
  if (fullName !== undefined) updateData.full_name = fullName;
  if (className !== undefined) updateData.class_name = className;
  if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
  
  let user: any = null;
  if (Object.keys(updateData).length > 0) {
    console.log("[SERVER] Supabase update payload (users):", JSON.stringify(updateData, null, 2));
    let { data: updatedUser, error } = await supabase.from('users').update(updateData).eq('id', userId).select().single();
    
    if (error) {
      console.error("[SERVER] Error updating user profile in public.users:", JSON.stringify(error, null, 2));
      if (error.message?.includes("avatar_url") || error.code === "PGRST204" || error.code === "PGRST100") {
        console.log("avatar_url column not found in public.users, falling back to auth user metadata");
        const fallbackPayload: any = {};
        if (fullName !== undefined) fallbackPayload.full_name = fullName;
        if (className !== undefined) fallbackPayload.class_name = className;
        
        let userOnly = null;
        if (Object.keys(fallbackPayload).length > 0) {
          const { data: fallbackUser, error: userErr } = await supabase.from('users').update(fallbackPayload).eq('id', userId).select().single();
          if (userErr) {
            console.error("[SERVER] Fallback user table update failed:", JSON.stringify(userErr, null, 2));
            return handleError(res, userErr, "Failed to update profile");
          }
          userOnly = fallbackUser;
        } else {
          const { data: fallbackUser } = await supabase.from('users').select('*').eq('id', userId).single();
          userOnly = fallbackUser;
        }
        
        // Update auth metadata
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { avatar_url: avatarUrl }
        });
        
        user = { ...userOnly, avatar_url: avatarUrl };
      } else {
        return handleError(res, error, "Failed to update profile");
      }
    } else {
      user = updatedUser;
    }
  } else {
    const { data: existingUser } = await supabase.from('users').select('*').eq('id', userId).single();
    user = existingUser;
  }
  
  const { data: dbRow } = await supabase.from('users').select('*').eq('id', userId).single();
  console.log("[SERVER] Database user row after update (profile):", JSON.stringify(dbRow, null, 2));
  res.json({ message: "Profile updated successfully", user: { ...user, avatarUrl: user.avatar_url || avatarUrl || "", fullName: user.full_name, className: user.class_name } });
}));

// --- EVENTS ---
app.get("/api/events", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabase.from('events').select('*').order('timestamp', { ascending: false });
  if (error) return handleError(res, error, "Failed to get events");
  const mapped = data.map((e: any) => ({ ...e, imageUrl: e.image_url, videoUrl: e.video_url, mediaUrls: e.media_urls }));
  res.json(mapped);
}));

app.post("/api/events", asyncHandler(async (req, res, next) => {
  console.log("[SERVER] POST /api/events - req.body:", JSON.stringify(req.body, null, 2));
  const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
  const newEvent = { id: crypto.randomUUID(), title, description, image_url: imageUrl, video_url: videoUrl, media_urls: mediaUrls, timestamp, created_at: new Date().toISOString() };
  console.log("[SERVER] Supabase insert payload (events):", JSON.stringify(newEvent, null, 2));
  const { error } = await supabase.from('events').insert(newEvent);
  if (error) return handleError(res, error, "Failed to create event");
  const { data: dbRow } = await supabase.from('events').select('*').eq('id', newEvent.id).single();
  console.log("[SERVER] Database row after insert (events):", JSON.stringify(dbRow, null, 2));
  res.json(newEvent);
}));

app.put("/api/events/:id", asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log("[SERVER] PUT /api/events/:id - req.body:", JSON.stringify(req.body, null, 2));
  const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
  const updatePayload = { title, description, image_url: imageUrl, video_url: videoUrl, media_urls: mediaUrls, timestamp };
  console.log("[SERVER] Supabase update payload (events):", JSON.stringify(updatePayload, null, 2));
  const { error } = await supabase.from('events').update(updatePayload).eq('id', id);
  if (error) return handleError(res, error, "Failed to update event");
  const { data: dbRow } = await supabase.from('events').select('*').eq('id', id).single();
  console.log("[SERVER] Database row after update (events):", JSON.stringify(dbRow, null, 2));
  res.json({ message: "Updated" });
}));

app.delete("/api/events/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('events').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete event");
  res.json({ message: "Deleted" });
}));

// --- NOTICES ---
app.get("/api/notices", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabase.from('notices').select('*').order('date', { ascending: false });
  if (error) return handleError(res, error, "Failed to get notices");
  const mapped = data.map((n: any) => ({ ...n, imageUrl: n.image_url, mediaUrls: n.media_urls }));
  res.json(mapped);
}));

app.post("/api/notices", asyncHandler(async (req, res, next) => {
  console.log("[SERVER] POST /api/notices - req.body:", JSON.stringify(req.body, null, 2));
  const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
  const newNotice = { id: crypto.randomUUID(), title, date, category, content, badge, priority, image_url: imageUrl, media_urls: mediaUrls, created_at: new Date().toISOString() };
  console.log("[SERVER] Supabase insert payload (notices):", JSON.stringify(newNotice, null, 2));
  const { error } = await supabase.from('notices').insert(newNotice);
  if (error) return handleError(res, error, "Failed to create notice");
  const { data: dbRow } = await supabase.from('notices').select('*').eq('id', newNotice.id).single();
  console.log("[SERVER] Database row after insert (notices):", JSON.stringify(dbRow, null, 2));
  res.json(newNotice);
}));

app.put("/api/notices/:id", asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log("[SERVER] PUT /api/notices/:id - req.body:", JSON.stringify(req.body, null, 2));
  const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
  const updatePayload = { title, date, category, content, badge, priority, image_url: imageUrl, media_urls: mediaUrls };
  console.log("[SERVER] Supabase update payload (notices):", JSON.stringify(updatePayload, null, 2));
  const { error } = await supabase.from('notices').update(updatePayload).eq('id', id);
  if (error) return handleError(res, error, "Failed to update notice");
  const { data: dbRow } = await supabase.from('notices').select('*').eq('id', id).single();
  console.log("[SERVER] Database row after update (notices):", JSON.stringify(dbRow, null, 2));
  res.json({ message: "Updated" });
}));

app.delete("/api/notices/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('notices').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete notice");
  res.json({ message: "Deleted" });
}));

// --- SETTINGS / HERO IMAGES & LIBRARY CONFIG ---
app.get("/api/settings/hero-images", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabase
    .from('settings_hero_images')
    .select('*')
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) return handleError(res, error, "Failed to get hero images");
  
  const urls = (data || []).map((row: any) => row.url);
  res.json(urls);
}));

app.post("/api/settings/hero-images", asyncHandler(async (req, res, next) => {
  console.log("[SERVER] POST /api/settings/hero-images - req.body:", JSON.stringify(req.body, null, 2));
  const { images } = req.body;
  const targetImages = images || [];

  // Clear existing welcome hero images
  await supabase
    .from('settings_hero_images')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (targetImages.length > 0) {
    const inserts = targetImages.map((url: string) => ({
      id: crypto.randomUUID(),
      url,
      caption: "Welcome Slide"
    }));
    console.log("[SERVER] Supabase insert payload (hero-images):", JSON.stringify(inserts, null, 2));
    const { error } = await supabase.from('settings_hero_images').insert(inserts);
    if (error) return handleError(res, error, "Failed to update hero images");
  }
  
  const { data: dbRows } = await supabase.from('settings_hero_images').select('*').neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("[SERVER] Database rows after insert (hero-images):", JSON.stringify(dbRows, null, 2));
  res.json({ success: true });
}));

app.get("/api/settings/library", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabase
    .from('settings_hero_images')
    .select('*')
    .eq('id', '00000000-0000-0000-0000-000000000000')
    .maybeSingle();

  const defaultSettings = {
    logoUrl: "",
    name: "PM SHRI SCHOOL",
    tag: "IIT POWAI SECTOR",
    headerTitle: "KV IIT Powai Digital Library Hub"
  };

  if (error || !data) {
    return res.json(defaultSettings);
  }

  try {
    const meta = JSON.parse(data.caption || "{}");
    res.json({
      logoUrl: data.url || "",
      name: meta.name || defaultSettings.name,
      tag: meta.tag || defaultSettings.tag,
      headerTitle: meta.headerTitle || defaultSettings.headerTitle
    });
  } catch (err) {
    res.json(defaultSettings);
  }
}));

app.put("/api/settings/library", asyncHandler(async (req, res, next) => {
  const { logoUrl, name, tag, headerTitle } = req.body;
  
  const captionValue = JSON.stringify({ name, tag, headerTitle });
  
  const { error } = await supabase
    .from('settings_hero_images')
    .upsert({
      id: '00000000-0000-0000-0000-000000000000',
      url: logoUrl || "",
      caption: captionValue
    });

  if (error) return handleError(res, error, "Failed to update library settings");
  
  res.json({ logoUrl, name, tag, headerTitle });
}));

// --- STAFF ---
app.get("/api/settings/staff", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabase.from('staff_members').select('*');
  if (error) return handleError(res, error, "Failed to get staff");
  
  const staffMembers = (data || []).filter((s: any) => !s.is_editorial).map((s: any) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    contribution: s.contribution,
    avatarColor: s.avatar_color,
    years: s.years,
    image: s.image
  }));
  const editorialTeam = (data || []).filter((s: any) => s.is_editorial).map((s: any) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    contribution: s.contribution,
    avatarColor: s.avatar_color,
    years: s.years,
    image: s.image
  }));
  res.json({ staffMembers, editorialTeam });
}));

app.put("/api/settings/staff", asyncHandler(async (req, res, next) => {
  console.log("[SERVER] PUT /api/settings/staff - req.body:", JSON.stringify(req.body, null, 2));
  const { staffMembers, editorialTeam } = req.body;
  
  // delete all existing rows
  await supabase.from('staff_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  const staffInserts = (staffMembers || []).map((s: any) => ({
    id: s.id || crypto.randomUUID(),
    name: s.name,
    role: s.role,
    contribution: s.contribution,
    avatar_color: s.avatarColor || "bg-indigo-100 text-indigo-700",
    years: s.years || "",
    image: s.image || "",
    is_editorial: false
  }));
  
  const editorialInserts = (editorialTeam || []).map((s: any) => ({
    id: s.id || crypto.randomUUID(),
    name: s.name,
    role: s.role,
    contribution: s.contribution,
    avatar_color: s.avatarColor || "bg-emerald-100 text-emerald-700",
    years: s.years || "",
    image: s.image || "",
    is_editorial: true
  }));
  
  const allInserts = [...staffInserts, ...editorialInserts];
  console.log("[SERVER] Supabase insert payload (staff):", JSON.stringify(allInserts, null, 2));
  if (allInserts.length > 0) {
    const { error } = await supabase.from('staff_members').insert(allInserts);
    if (error) return handleError(res, error, "Failed to save staff members");
  }
  
  const { data: dbRows } = await supabase.from('staff_members').select('*');
  console.log("[SERVER] Database rows after insert (staff):", JSON.stringify(dbRows, null, 2));
  res.json({ success: true });
}));

// --- QUIZ LINKS ---
app.get("/api/quiz-links", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabase.from('quiz_links').select('*');
  if (error) return handleError(res, error, "Failed to get quiz links");
  res.json(data);
}));

app.post("/api/quiz-links", asyncHandler(async (req, res, next) => {
  const { title, url } = req.body;
  const newLink = { id: crypto.randomUUID(), title, url, created_at: new Date().toISOString() };
  const { error } = await supabase.from('quiz_links').insert(newLink);
  if (error) return handleError(res, error, "Failed to add link");
  res.json(newLink);
}));

app.delete("/api/quiz-links/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('quiz_links').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete link");
  res.json({ message: "Deleted" });
}));

// --- MAGAZINES ---
app.get("/api/magazines", asyncHandler(async (req, res, next) => {
  const { data, error } = await supabase.from('magazines').select('*').order('date', { ascending: false });
  if (error) return handleError(res, error, "Failed to get magazines");
  const mapped = data.map((m: any) => ({ ...m, coverColor: m.cover_color, coverImage: m.cover_image, readLink: m.read_link }));
  res.json(mapped);
}));

app.post("/api/magazines", asyncHandler(async (req, res, next) => {
  console.log("[SERVER] POST /api/magazines - req.body:", JSON.stringify(req.body, null, 2));
  const { title, description, coverColor, coverImage, date, readLink } = req.body;
  const newMag = { id: crypto.randomUUID(), title, description, cover_color: coverColor, cover_image: coverImage, date, read_link: readLink, created_at: new Date().toISOString() };
  console.log("[SERVER] Supabase insert payload (magazines):", JSON.stringify(newMag, null, 2));
  const { error } = await supabase.from('magazines').insert(newMag);
  if (error) return handleError(res, error, "Failed to add magazine");
  const { data: dbRow } = await supabase.from('magazines').select('*').eq('id', newMag.id).single();
  console.log("[SERVER] Database row after insert (magazines):", JSON.stringify(dbRow, null, 2));
  res.json(newMag);
}));

app.put("/api/magazines/:id", asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  console.log("[SERVER] PUT /api/magazines/:id - req.body:", JSON.stringify(req.body, null, 2));
  const { title, description, coverColor, coverImage, date, readLink } = req.body;
  const updatePayload = { title, description, cover_color: coverColor, cover_image: coverImage, date, read_link: readLink };
  console.log("[SERVER] Supabase update payload (magazines):", JSON.stringify(updatePayload, null, 2));
  const { error } = await supabase.from('magazines').update(updatePayload).eq('id', id);
  if (error) return handleError(res, error, "Failed to update magazine");
  const { data: dbRow } = await supabase.from('magazines').select('*').eq('id', id).single();
  console.log("[SERVER] Database row after update (magazines):", JSON.stringify(dbRow, null, 2));
  res.json({ message: "Updated" });
}));

app.delete("/api/magazines/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('magazines').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete magazine");
  res.json({ message: "Deleted" });
}));

// --- READERS CLUB ---
app.get("/api/readers-club", asyncHandler(async (req, res, next) => {
  const { data: folders, error: fError } = await supabase.from('readers_club_folders').select('*').order('display_order', { ascending: true });
  const { data: members, error: mError } = await supabase.from('readers_club_members').select('*');
  if (fError || mError) return handleError(res, fError || mError, "Failed to get readers club");
  
  const mappedFolders = folders?.map((f: any) => {
    const folderMembers = (members || []).filter((m: any) => m.folder_id === f.id).map((m: any) => ({
      ...m, avatarColor: m.avatar_color
    }));
    return { ...f, members: folderMembers };
  }) || [];
  res.json({ folders: mappedFolders });
}));

app.post("/api/readers-club", asyncHandler(async (req, res, next) => {
  console.log("[SERVER] POST /api/readers-club - req.body:", JSON.stringify(req.body, null, 2));
  const { folders } = req.body;
  await supabase.from('readers_club_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('readers_club_folders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  for (const f of folders) {
    const folderPayload = { id: f.id, name: f.name, color: f.color, logo: f.logo };
    console.log("[SERVER] Supabase insert payload (readers_club_folders):", JSON.stringify(folderPayload, null, 2));
    const { error: folderError } = await supabase.from('readers_club_folders').insert(folderPayload);
    if (folderError) {
      console.error("[SERVER ERROR] readers_club_folders insert failed:", folderError);
      return handleError(res, folderError, "Failed to insert readers club folder");
    }
    
    if (f.members && f.members.length > 0) {
      const mappedMembers = f.members.map((m: any) => ({
        id: m.id || crypto.randomUUID(), 
        folder_id: f.id, 
        name: m.name, 
        role: m.role, 
        contribution: m.contribution, 
        grade: m.grade || "", 
        avatar_color: m.avatarColor || "bg-blue-100 text-blue-700", 
        image: m.image || ""
      }));
      console.log("[SERVER] Supabase insert payload (readers_club_members):", JSON.stringify(mappedMembers, null, 2));
      const { error: memberError } = await supabase.from('readers_club_members').insert(mappedMembers);
      if (memberError) {
        console.error("[SERVER ERROR] readers_club_members insert failed:", memberError);
        return handleError(res, memberError, "Failed to insert readers club members");
      }
    }
  }
  
  const { data: dbFolders } = await supabase.from('readers_club_folders').select('*');
  const { data: dbMembers } = await supabase.from('readers_club_members').select('*');
  console.log("[SERVER] Database folders after insert (readers-club):", JSON.stringify(dbFolders, null, 2));
  console.log("[SERVER] Database members after insert (readers-club):", JSON.stringify(dbMembers, null, 2));
  res.json({ success: true });
}));

// --- SOCIAL POSTS ---
app.get("/api/social/posts", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('library_posts').select('*').order('created_at', { ascending: false });
    if (error) {
      // Fallback to social_posts for preview if library_posts doesn't exist
      if (error.code === 'PGRST205') {
        const fallback = await supabase.from('social_posts').select('*').order('timestamp', { ascending: false });
        if (!fallback.error) {
          const mapped = (fallback.data || []).map((p: any) => ({
            id: p.id, studentName: p.student_name, className: p.class_name, avatarSeed: p.avatar_seed,
            bookTitle: p.book_title, author: p.author, rating: p.rating, content: p.content,
            timestamp: p.created_at || p.timestamp, likes: p.likes || 0, commentsCount: p.comments_count || 0,
            tags: p.tags || [], photoUrl: p.photo_url
          }));
          return res.json(mapped);
        }
      }
      return handleError(res, error, "Failed to get posts");
    }
    
    const mapped = (data || []).map((p: any) => ({
      id: p.id,
      studentName: p.student_name || 'Anonymous',
      className: p.class_name || '',
      avatarSeed: p.avatar_url || 'a',
      bookTitle: p.book_title,
      author: p.author_name,
      rating: p.rating,
      content: p.review,
      timestamp: p.created_at,
      likes: p.likes || 0,
      commentsCount: p.comments_count || 0,
      tags: p.hashtags || [],
      photoUrl: p.photo_url
    }));
    res.json(mapped);
  } catch (err) {
    handleError(res, err, "Failed to fetch posts from database");
  }
}));

app.post("/api/social/posts", asyncHandler(async (req, res, next) => {
  const { studentName, className, avatarSeed, bookTitle, author, rating, content, tags, photoUrl } = req.body;
  
  // Try library_posts first
  const newPost = {
    student_name: studentName,
    class_name: className,
    avatar_url: avatarSeed,
    book_title: bookTitle,
    author_name: author,
    rating,
    review: content,
    created_at: new Date().toISOString(),
    likes: 0,
    comments_count: 0,
    hashtags: tags,
    photo_url: photoUrl
  };
  
  let { data, error } = await supabase.from('library_posts').insert(newPost).select().single();
  
  if (error && error.code === 'PGRST205') {
    // Fallback to social_posts for preview
    const fallbackPost = {
      id: crypto.randomUUID(),
      student_name: studentName,
      class_name: className,
      avatar_seed: avatarSeed,
      book_title: bookTitle,
      author,
      rating,
      content,
      likes: 0,
      comments_count: 0,
      tags,
      photo_url: photoUrl
    };
    const fallbackRes = await supabase.from('social_posts').insert(fallbackPost).select().single();
    error = fallbackRes.error;
    data = fallbackRes.data;
    if (!error && data) {
       return res.json({
         id: data.id, studentName: data.student_name, className: data.class_name, avatarSeed: data.avatar_seed,
         bookTitle: data.book_title, author: data.author, rating: data.rating, content: data.content,
         timestamp: data.created_at || new Date().toISOString(), likes: data.likes || 0, commentsCount: data.comments_count || 0,
         tags: data.tags || [], photoUrl: data.photo_url
       });
    }
  }

  if (error) return handleError(res, error, "Failed to add post");
  
  res.json({
    id: data.id,
    studentName: data.student_name,
    className: data.class_name,
    avatarSeed: data.avatar_url,
    bookTitle: data.book_title,
    author: data.author_name,
    rating: data.rating,
    content: data.review,
    timestamp: data.created_at,
    likes: data.likes || 0,
    commentsCount: data.comments_count || 0,
    tags: data.hashtags || [],
    photoUrl: data.photo_url
  });
}));

app.post("/api/social/posts/:id/like", asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  
  // Try library_posts
  let table = 'library_posts';
  let { data: post, error } = await supabase.from(table).select('*').eq('id', req.params.id).single();
  
  if (error && error.code === 'PGRST205') {
    table = 'social_posts';
    const fallback = await supabase.from(table).select('*').eq('id', req.params.id).single();
    post = fallback.data;
    error = fallback.error;
  }
  
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const likedBy = post.liked_by || [];
  let newLikes = post.likes || 0;
  
  if (likedBy.includes(userId)) {
    likedBy.splice(likedBy.indexOf(userId), 1);
    newLikes = Math.max(0, newLikes - 1);
  } else {
    likedBy.push(userId);
    newLikes++;
  }
  
  await supabase.from(table).update({ likes: newLikes, liked_by: likedBy }).eq('id', req.params.id);
  res.json({ likes: newLikes, isLiked: likedBy.includes(userId) });
}));

app.post("/api/social/posts/:id/comment", asyncHandler(async (req, res, next) => {
  const { comment, authorName, authorAvatar } = req.body;
  let table = 'library_posts';
  let { data: post, error } = await supabase.from(table).select('*').eq('id', req.params.id).single();
  
  if (error && error.code === 'PGRST205') {
    table = 'social_posts';
    const fallback = await supabase.from(table).select('*').eq('id', req.params.id).single();
    post = fallback.data;
    error = fallback.error;
  }
  
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const comments = post.comments || [];
  const newComment = { id: crypto.randomUUID(), text: comment.text || comment, author: authorName, avatar: authorAvatar, timestamp: new Date().toISOString() };
  comments.push(newComment);
  
  await supabase.from(table).update({ comments, comments_count: comments.length }).eq('id', req.params.id);
  res.json({ message: "Comment added", comment: newComment });
}));

app.delete("/api/social/posts/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('library_posts').delete().eq('id', req.params.id);
  if (error && error.code === 'PGRST205') {
    await supabase.from('social_posts').delete().eq('id', req.params.id);
  }
  res.json({ message: "Deleted" });
}));

// --- AI ROUTES ---
app.post("/api/story/generate", asyncHandler(async (req, res, next) => {
  try {
    const { character, setting, genre, ageGroup, previousStory } = req.body;
    let prompt = `Write a short, engaging story chapter for a ${ageGroup} child. 
    Genre: ${genre}. Main Character: ${character}. Setting: ${setting}.`;
    if (previousStory) prompt += `

Previous story context: ${previousStory}`;
    prompt += `
Provide exactly two output sections separated by "---CHOICES---". First section is the story (2-3 paragraphs). Second section is exactly 2 choices for what happens next, bulleted with '- '.`;

    const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    const responseText = result.text || "";
    const parts = responseText.split("---CHOICES---");
    const storySegment = parts[0]?.trim() || "The story continues...";
    const choices = parts[1]?.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-/, '').trim()) || ["Turn left", "Turn right"];
    
    res.json({ storySegment, choices, illustrationPrompt: `A children's book illustration about ${character} in ${setting}, ${genre} style, vibrant colors.` });
  } catch (err) { handleError(res, err, "AI error"); }
}));

app.post("/api/books/recommend", asyncHandler(async (req, res, next) => {
  try {
    const { interests, age, readingLevel } = req.body;
    const prompt = `Recommend 3 books for a ${age}-year-old student interested in: ${interests}. Reading level: ${readingLevel}.
    Format as JSON array of objects with keys: title, author, genre, description, whyRecommended, difficulty, funActivity. No markdown blocks, just raw JSON array.`;
    
    const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    let text = result.text || "[]";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json({ recommendations: JSON.parse(text) });
  } catch (err) { handleError(res, err, "AI error"); }
}));

app.post("/api/creative/write", asyncHandler(async (req, res, next) => {
  try {
    const { topic, format, tone, length } = req.body;
    const prompt = `Write a ${length} ${format} about ${topic} in a ${tone} tone.`;
    const result = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: prompt });
    res.json({ result: result.text });
  } catch (err) { handleError(res, err, "AI error"); }
}));

app.post("/api/creative/image", asyncHandler(async (req, res, next) => {
  try {
    const { prompt, style } = req.body;
    const response = await openai.images.generate({ model: "dall-e-3", prompt: `${style} style: ${prompt}`, n: 1, size: "1024x1024" });
    res.json({ imageUrl: response.data[0].url });
  } catch (err) { handleError(res, err, "AI error"); }
}));

app.get("/api/test-env-vars", (req, res) => {
  res.json({
    envKeys: Object.keys(process.env),
    httpProxy: process.env.http_proxy || process.env.HTTP_PROXY,
    httpsProxy: process.env.https_proxy || process.env.HTTPS_PROXY,
    noProxy: process.env.no_proxy || process.env.NO_PROXY,
  });
});


// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});


// --- LIBRARY SHOWCASE ---
app.get("/api/library-showcase", asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('library_showcase')
    .select('*')
    .eq('is_active', true)
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json(error);
  res.json(data || []);
}));

app.get("/api/admin/library-showcase", asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('library_showcase')
    .select('*')
    .order('featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json(error);
  res.json(data || []);
}));

app.get("/api/library-showcase/:id", asyncHandler(async (req: any, res: any) => {
  const { data, error } = await supabase.from('library_showcase').select('*').eq('id', req.params.id).single();
  if (error) return res.status(500).json(error);
  res.json(data);
}));

app.get("/api/library-showcase/:id/likes", asyncHandler(async (req: any, res: any) => {
  const { data, error } = await supabase.from('library_showcase').select('likes').eq('id', req.params.id).single();
  if (error) return res.status(500).json(error);
  res.json({ likes: data?.likes || 0 });
}));

app.get("/api/library-showcase/:id/liked-status", asyncHandler(async (req: any, res: any) => {
  const { user_id, visitor_hash } = req.query;
  const postId = req.params.id;

  const { count, error: countError } = await supabase
    .from('library_showcase_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (countError) console.error("GET countError:", countError);
  const exactLikes = (countError || count === null) ? 0 : count;

  let isLiked = false;
  if (user_id || visitor_hash) {
    let query = supabase
      .from('library_showcase_likes')
      .select('id')
      .eq('post_id', postId)
      .limit(1);

    if (user_id) {
      query = query.eq('user_id', String(user_id));
    } else if (visitor_hash) {
      query = query.eq('visitor_hash', String(visitor_hash));
    }

    const { data: existingRows } = await query;
    if (existingRows && existingRows.length > 0) {
      isLiked = true;
    }
  }

  await supabase.from('library_showcase').update({ likes: exactLikes }).eq('id', postId);

  res.json({ liked: isLiked, likes: exactLikes });
}));

app.post("/api/library-showcase/:id/like", asyncHandler(async (req: any, res: any) => {
  const postId = req.params.id;
  const { user_id, visitor_hash } = req.body;

  if (!user_id && !visitor_hash) {
    return res.status(400).json({ error: "User ID or Visitor Hash is required" });
  }

  let query = supabase
    .from('library_showcase_likes')
    .select('id')
    .eq('post_id', postId);

  if (user_id) {
    query = query.eq('user_id', String(user_id));
  } else if (visitor_hash) {
    query = query.eq('visitor_hash', String(visitor_hash));
  }

  const { data: existingRows } = await query;

  let nowLiked = false;

  if (existingRows && existingRows.length > 0) {
    let delQuery = supabase
      .from('library_showcase_likes')
      .delete()
      .eq('post_id', postId);
      
    if (user_id) {
      delQuery = delQuery.eq('user_id', String(user_id));
    } else {
      delQuery = delQuery.eq('visitor_hash', String(visitor_hash));
    }
    await delQuery;
    nowLiked = false;
  } else {
    const payload: any = { post_id: postId };
    if (user_id) payload.user_id = String(user_id);
    if (visitor_hash) payload.visitor_hash = String(visitor_hash);

    const insertResult = await supabase
      .from('library_showcase_likes')
      .insert(payload);
    nowLiked = true;
    if (insertResult.error) console.error("Insert error:", insertResult.error);
  }

  const { count, error: countError } = await supabase
    .from('library_showcase_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (countError) console.error("POST countError:", countError);
  const exactLikes = (countError || count === null) ? 0 : count;

  await supabase.from('library_showcase').update({ likes: exactLikes }).eq('id', postId);

  res.json({ liked: nowLiked, likes: exactLikes });
}));

app.post("/api/library-showcase/:id/view", asyncHandler(async (req: any, res: any) => {
  const postId = req.params.id;
  const { identifier } = req.body;

  const { data: post } = await supabase.from('library_showcase').select('views').eq('id', postId).single();
  let currentViews = post?.views || 0;

  if (!identifier) {
    return res.json({ views: currentViews, recorded: false });
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentView } = await supabase
    .from('library_showcase_views')
    .select('id')
    .eq('post_id', postId)
    .eq('identifier', String(identifier))
    .gte('viewed_at', twentyFourHoursAgo)
    .maybeSingle();

  if (recentView) {
    return res.json({ views: currentViews, recorded: false });
  }

  await supabase.from('library_showcase_views').insert({
    post_id: postId,
    identifier: String(identifier),
    viewed_at: new Date().toISOString()
  });

  currentViews += 1;
  await supabase.from('library_showcase').update({ views: currentViews }).eq('id', postId);

  res.json({ views: currentViews, recorded: true });
}));

app.post("/api/admin/library-showcase", asyncHandler(async (req: any, res: any) => {
  const payload = { ...req.body };
  delete payload.id;
  const { error, data } = await supabase.from('library_showcase').insert(payload).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
}));

app.put("/api/admin/library-showcase/:id", asyncHandler(async (req: any, res: any) => {
  const payload = { ...req.body };
  delete payload.id;
  payload.updated_at = new Date().toISOString();
  const { error, data } = await supabase.from('library_showcase').update(payload).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
}));

app.get("/api/library-showcase/:id/images", asyncHandler(async (req: any, res: any) => {
  const { data, error } = await supabase
    .from('library_showcase_images')
    .select('*')
    .eq('post_id', req.params.id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json(error);
  res.json(data || []);
}));

app.post("/api/admin/library-showcase/:id/images", asyncHandler(async (req: any, res: any) => {
  const postId = req.params.id;
  const { images } = req.body;
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: "Invalid images array" });
  }

  try {
    const { data: existingImages } = await supabase
      .from('library_showcase_images')
      .select('image_url')
      .eq('post_id', postId);

    const newUrls = new Set(images.map((img: any) => img.image_url));

    if (existingImages && existingImages.length > 0) {
      for (const img of existingImages) {
        if (img.image_url && !newUrls.has(img.image_url)) {
          let path = img.image_url;
          if (path.includes('/library-showcase/')) {
            path = path.split('/library-showcase/')[1];
          } else if (path.startsWith('http://') || path.startsWith('https://')) {
            continue;
          }
          if (path) {
            const cleanPath = path.replace(/^\//, '');
            await supabaseAdmin.storage.from('library-showcase').remove([cleanPath]);
          }
        }
      }
    }
  } catch (err) {
    console.error("Failed cleaning up old gallery storage files:", err);
  }

  await supabase.from('library_showcase_images').delete().eq('post_id', postId);

  if (images.length > 0) {
    const rowsToInsert = images.map((img: any, idx: number) => ({
      post_id: postId,
      image_url: img.image_url,
      display_order: typeof img.display_order === 'number' ? img.display_order : idx
    }));

    const { data, error } = await supabase
      .from('library_showcase_images')
      .insert(rowsToInsert)
      .select('*');

    if (error) return res.status(500).json(error);
    return res.json(data || []);
  }

  res.json([]);
}));

app.delete("/api/admin/library-showcase/:id", asyncHandler(async (req: any, res: any) => {
  // Try to delete storage files first
  try {
    const { data: post } = await supabase.from('library_showcase').select('*').eq('id', req.params.id).single();
    if (post) {
      const urls = [post.image_url, post.video_url, post.document_url].filter(Boolean);
      
      const { data: galleryImgs } = await supabase
        .from('library_showcase_images')
        .select('image_url')
        .eq('post_id', req.params.id);

      if (galleryImgs) {
        galleryImgs.forEach((gi: any) => {
          if (gi.image_url) urls.push(gi.image_url);
        });
      }

      for (const url of urls) {
        if (url && typeof url === 'string') {
          let path = url;
          if (url.includes('/library-showcase/')) {
            path = url.split('/library-showcase/')[1];
          } else if (url.startsWith('http://') || url.startsWith('https://')) {
            // External URL, do not delete
            continue;
          }
          if (path) {
            const cleanPath = path.replace(/^\//, '');
            await supabaseAdmin.storage.from('library-showcase').remove([cleanPath]);
          }
        }
      }
    }
  } catch (err) {
    console.error("Storage cleanup failed:", err);
  }

  await supabase.from('library_showcase_images').delete().eq('post_id', req.params.id);
  await supabase.from('library_showcase_likes').delete().eq('post_id', req.params.id);
  await supabase.from('library_showcase_views').delete().eq('post_id', req.params.id);

  const { error } = await supabase.from('library_showcase').delete().eq('id', req.params.id);
  if (error) return res.status(500).json(error);
  res.json({ success: true });
}));


// --- ADMIN READER CLUB MANAGER ---
app.get("/api/admin/readers-club/folders", asyncHandler(async (req: any, res: any) => {
  const { data, error } = await supabase.from('readers_club_folders').select('*').order('display_order', { ascending: true });
  if (error) return handleError(res, error, "Failed to fetch folders");
  res.json({ folders: data || [] });
}));

app.put("/api/admin/readers-club/folders/reorder", asyncHandler(async (req: any, res: any) => {
  const { folders } = req.body;
  if (folders && folders.length > 0) {
    for (const folder of folders) {
      await supabase.from('readers_club_folders').update({ display_order: folder.display_order }).eq('id', folder.id);
    }
  }
  res.json({ success: true });
}));

app.put("/api/admin/readers-club/folders/:id", asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const payload = req.body;
  const { data: existing } = await supabase.from('readers_club_folders').select('*').eq('id', id).single();
  const { error } = await supabase.from('readers_club_folders').update({
    name: payload.name, description: payload.description, color: payload.color,
    logo: payload.logo, cover_image: payload.cover_image, banner_image: payload.banner_image,
    display_order: payload.display_order, is_active: payload.is_active
  }).eq('id', id);
  if (error) return handleError(res, error, "Failed to update folder");
  if (existing) {
    const imagesToCheck = ['logo', 'cover_image', 'banner_image'];
    for (const key of imagesToCheck) {
      if (existing[key] && payload[key] && existing[key] !== payload[key]) {
        const path = existing[key].split('/reader-clubs/')[1];
        if (path) await supabaseAdmin.storage.from('reader-clubs').remove([path]);
      }
    }
  }
  res.json({ success: true });
}));

app.delete("/api/admin/readers-club/folders/:id", asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const { data: files } = await supabaseAdmin.storage.from('reader-clubs').list(id);
    if (files && files.length > 0) {
      const filesToRemove = files.map(f => `${id}/${f.name}`);
      await supabaseAdmin.storage.from('reader-clubs').remove(filesToRemove);
    }
    const { data: galleryFiles } = await supabaseAdmin.storage.from('reader-clubs').list(`${id}/gallery`);
    if (galleryFiles && galleryFiles.length > 0) {
      const galleryFilesToRemove = galleryFiles.map(f => `${id}/gallery/${f.name}`);
      await supabaseAdmin.storage.from('reader-clubs').remove(galleryFilesToRemove);
    }
  } catch (e) {
    console.error("Failed to delete storage files for folder", e);
  }
  const { error } = await supabase.from('readers_club_folders').delete().eq('id', id);
  if (error) return handleError(res, error, "Failed to delete folder");
  res.json({ success: true });
}));

app.put("/api/admin/readers-club/folders/:id/photos/reorder", asyncHandler(async (req: any, res: any) => {
  const { photos } = req.body;
  if (photos && photos.length > 0) {
    for (const photo of photos) {
      await supabase.from('readers_club_photos').update({ display_order: photo.display_order }).eq('id', photo.id);
    }
  }
  res.json({ success: true });
}));

app.get("/api/admin/readers-club/folders/:id/photos", asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('readers_club_photos').select('*').eq('folder_id', id).order('display_order', { ascending: true });
  if (error) return handleError(res, error, "Failed to fetch photos");
  res.json({ photos: data || [] });
}));

app.post("/api/admin/readers-club/folders/:id/photos", asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  const { url, display_order } = req.body;
  const { error } = await supabase.from('readers_club_photos').insert({ folder_id: id, url, display_order: display_order || 0 });
  if (error) return handleError(res, error, "Failed to insert photo");
  res.json({ success: true });
}));

app.delete("/api/admin/readers-club/folders/:id/photos/:photo_id", asyncHandler(async (req: any, res: any) => {
  const { photo_id } = req.params;
  const { data: photo } = await supabase.from('readers_club_photos').select('*').eq('id', photo_id).single();
  if (photo && photo.url) {
    const path = photo.url.split('/reader-clubs/')[1];
    if (path) await supabaseAdmin.storage.from('reader-clubs').remove([path]);
  }
  const { error } = await supabase.from('readers_club_photos').delete().eq('id', photo_id);
  if (error) return handleError(res, error, "Failed to delete photo");
  res.json({ success: true });
}));

// --- LIBRARY ACHIEVERS ---
app.get("/api/library-achievers/categories", asyncHandler(async (req: any, res: any) => {
  const { data, error } = await supabase
    .from('library_achiever_categories')
    .select('*')
    .order('is_pinned', { ascending: false, nullsFirst: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json(error);
  res.json(data || []);
}));

app.post("/api/admin/library-achievers/categories", requireAdmin, asyncHandler(async (req: any, res: any) => {
  const payload = { ...req.body };
  delete payload.id;
  const { error, data } = await supabaseAdmin.from('library_achiever_categories').insert(payload).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
}));

app.put("/api/admin/library-achievers/categories/:id", requireAdmin, asyncHandler(async (req: any, res: any) => {
  const payload = { ...req.body };
  delete payload.id;
  payload.updated_at = new Date().toISOString();
  const { error, data } = await supabaseAdmin.from('library_achiever_categories').update(payload).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
}));

app.delete("/api/admin/library-achievers/categories/:id", requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, error: "Category ID is required" });
  }

  // 1. Confirm category exists
  const { data: category, error: findError } = await supabaseAdmin
    .from('library_achiever_categories')
    .select('id, name')
    .eq('id', id)
    .maybeSingle();

  if (findError) {
    return res.status(500).json({ success: false, error: findError.message || "Failed to find category" });
  }
  if (!category) {
    return res.status(404).json({ success: false, error: "Category not found" });
  }

  // 2. Storage cleanup for any achievers inside this category
  try {
    const { data: catAchievers } = await supabaseAdmin
      .from('library_achievers')
      .select('id, profile_photo')
      .eq('category_id', id);

    if (catAchievers && catAchievers.length > 0) {
      for (const ach of catAchievers) {
        if (ach.profile_photo) {
          let path = ach.profile_photo;
          if (path.includes('/library-achievers/')) {
            path = path.split('/library-achievers/')[1];
          }
          if (path && !path.startsWith('http')) {
            const cleanPath = decodeURIComponent(path.replace(/^\//, '').split('?')[0]);
            await supabaseAdmin.storage.from('library-achievers').remove([cleanPath]);
          }
        }
        try {
          const { data: folderFiles } = await supabaseAdmin.storage.from('library-achievers').list(`members/${ach.id}`);
          if (folderFiles && folderFiles.length > 0) {
            await supabaseAdmin.storage.from('library-achievers').remove(folderFiles.map(f => `members/${ach.id}/${f.name}`));
          }
        } catch (_) {}
      }
    }
  } catch (storageErr) {
    console.error("Storage cleanup for category achievers failed (non-blocking):", storageErr);
  }

  // 3. Delete category by ID from public.library_achiever_categories (cascades achievers)
  const { error } = await supabaseAdmin.from('library_achiever_categories').delete().eq('id', id);
  if (error) {
    return res.status(500).json({ success: false, error: error.message || "Failed to delete category" });
  }

  res.json({ success: true });
}));

app.get("/api/library-achievers", asyncHandler(async (req: any, res: any) => {
  const { data, error } = await supabase
    .from('library_achievers')
    .select('*, library_achiever_categories(name)')
    .order('is_pinned', { ascending: false, nullsFirst: false })
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json(error);
  res.json(data || []);
}));

app.post("/api/admin/library-achievers", requireAdmin, asyncHandler(async (req: any, res: any) => {
  const payload = { ...req.body };
  delete payload.id;
  delete payload.library_achiever_categories;
  const { error, data } = await supabaseAdmin.from('library_achievers').insert(payload).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
}));

app.put("/api/admin/library-achievers/:id", requireAdmin, asyncHandler(async (req: any, res: any) => {
  const payload = { ...req.body };
  delete payload.id;
  delete payload.library_achiever_categories;
  payload.updated_at = new Date().toISOString();
  const { error, data } = await supabaseAdmin.from('library_achievers').update(payload).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json(error);
  res.json(data);
}));

app.delete("/api/admin/library-achievers/:id", requireAdmin, asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, error: "Achiever ID is required" });
  }

  // 1. Confirm achiever exists
  const { data: achiever, error: findError } = await supabaseAdmin
    .from('library_achievers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (findError) {
    return res.status(500).json({ success: false, error: findError.message || "Failed to find achiever" });
  }
  if (!achiever) {
    return res.status(404).json({ success: false, error: "Achiever not found" });
  }

  // 2. Storage cleanup if photo exists
  if (achiever.profile_photo) {
    try {
      let path = achiever.profile_photo;
      if (path.includes('/library-achievers/')) {
        path = path.split('/library-achievers/')[1];
      }
      if (path && !path.startsWith('http')) {
        const cleanPath = decodeURIComponent(path.replace(/^\//, '').split('?')[0]);
        await supabaseAdmin.storage.from('library-achievers').remove([cleanPath]);
      }
      const { data: folderFiles } = await supabaseAdmin.storage.from('library-achievers').list(`members/${id}`);
      if (folderFiles && folderFiles.length > 0) {
        await supabaseAdmin.storage.from('library-achievers').remove(folderFiles.map(f => `members/${id}/${f.name}`));
      }
    } catch (storageErr) {
      console.error("Storage cleanup failed for achiever (non-blocking):", storageErr);
    }
  }

  // 3. Delete row from public.library_achievers
  const { error } = await supabaseAdmin.from('library_achievers').delete().eq('id', id);
  if (error) {
    return res.status(500).json({ success: false, error: error.message || "Failed to delete achiever from database" });
  }

  res.json({ success: true });
}));

// VITE SERVER
if (process.env.NODE_ENV !== "production") {
  createViteServer({ server: { middlewareMode: true }, appType: "spa" }).then(vite => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req: any, res: any) => res.sendFile(path.join(distPath, "index.html")));
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}
