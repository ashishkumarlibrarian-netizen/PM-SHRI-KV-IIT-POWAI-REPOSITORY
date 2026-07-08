
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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(supabaseUrl, supabaseKey);

// AI Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });

// Dummy session store (can also be moved to Supabase if needed, but simple memory is fine for MVP)
const sessions = new Map();

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

// --- FILE UPLOAD ---
app.post("/api/upload", upload.single("file"), asyncHandler(async (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const bucket = req.body.bucket || "documents";
  
  // Generate a clean random filename
  const fileExt = req.file.originalname.split('.').pop() || 'jpg';
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  
  console.log(`Backend uploading file: ${fileName} to bucket: ${bucket}`);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: true
    });
    
  if (error) {
    console.error(`Upload error for bucket ${bucket}:`, error);
    return handleError(res, error, `Failed to upload to bucket ${bucket}`);
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
    
  res.json({ publicUrl });
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
        className: newUser.class_name
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
        className: finalUser.class_name
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
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
  
  const userId = sessions.get(token);
  const { fullName, className, avatarUrl, password } = req.body;

  if (password && password.trim() !== "") {
    const { error: pwdError } = await supabase.auth.admin.updateUserById(userId, {
      password: password
    });
    if (pwdError) {
      return res.status(400).json({ error: "Password update failed: " + pwdError.message });
    }
  }
  
  let updateData: any = { 
    full_name: fullName, 
    class_name: className, 
    avatar_url: avatarUrl 
  };
  
  let { data: user, error } = await supabase.from('users').update(updateData).eq('id', userId).select().single();
  
  if (error && (error.message?.includes("avatar_url") || error.code === "PGRST204" || error.code === "PGRST100")) {
    console.log("avatar_url column not found in public.users, falling back to auth user metadata");
    // Fallback: update only full_name and class_name in public.users
    const { data: userOnly, error: userErr } = await supabase.from('users').update({ 
      full_name: fullName, 
      class_name: className 
    }).eq('id', userId).select().single();
    
    if (userErr) return handleError(res, userErr, "Failed to update profile");
    
    // Update auth metadata
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { avatar_url: avatarUrl }
    });
    
    user = { ...userOnly, avatar_url: avatarUrl };
  } else if (error) {
    return handleError(res, error, "Failed to update profile");
  }
  
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
  const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
  const newEvent = { id: crypto.randomUUID(), title, description, image_url: imageUrl, video_url: videoUrl, media_urls: mediaUrls, timestamp, created_at: new Date().toISOString() };
  const { error } = await supabase.from('events').insert(newEvent);
  if (error) return handleError(res, error, "Failed to create event");
  res.json(newEvent);
}));

app.put("/api/events/:id", asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
  const { error } = await supabase.from('events').update({ title, description, image_url: imageUrl, video_url: videoUrl, media_urls: mediaUrls, timestamp }).eq('id', id);
  if (error) return handleError(res, error, "Failed to update event");
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
  const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
  const newNotice = { id: crypto.randomUUID(), title, date, category, content, badge, priority, image_url: imageUrl, media_urls: mediaUrls, created_at: new Date().toISOString() };
  const { error } = await supabase.from('notices').insert(newNotice);
  if (error) return handleError(res, error, "Failed to create notice");
  res.json(newNotice);
}));

app.put("/api/notices/:id", asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
  const { error } = await supabase.from('notices').update({ title, date, category, content, badge, priority, image_url: imageUrl, media_urls: mediaUrls }).eq('id', id);
  if (error) return handleError(res, error, "Failed to update notice");
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
    const { error } = await supabase.from('settings_hero_images').insert(inserts);
    if (error) return handleError(res, error, "Failed to update hero images");
  }
  
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
  const { staffMembers, editorialTeam } = req.body;
  
  // delete all existing rows
  await supabase.from('staff_members').delete().neq('id', '0');
  
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
  if (allInserts.length > 0) {
    const { error } = await supabase.from('staff_members').insert(allInserts);
    if (error) return handleError(res, error, "Failed to save staff members");
  }
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
  const { title, description, coverColor, coverImage, date, readLink } = req.body;
  const newMag = { id: crypto.randomUUID(), title, description, cover_color: coverColor, cover_image: coverImage, date, read_link: readLink, created_at: new Date().toISOString() };
  const { error } = await supabase.from('magazines').insert(newMag);
  if (error) return handleError(res, error, "Failed to add magazine");
  res.json(newMag);
}));

app.put("/api/magazines/:id", asyncHandler(async (req, res, next) => {
  const { title, description, coverColor, coverImage, date, readLink } = req.body;
  const { error } = await supabase.from('magazines').update({ title, description, cover_color: coverColor, cover_image: coverImage, date, read_link: readLink }).eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to update magazine");
  res.json({ message: "Updated" });
}));

app.delete("/api/magazines/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('magazines').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete magazine");
  res.json({ message: "Deleted" });
}));

// --- READERS CLUB ---
app.get("/api/readers-club", asyncHandler(async (req, res, next) => {
  const { data: folders, error: fError } = await supabase.from('readers_club_folders').select('*');
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
  const { folders } = req.body;
  await supabase.from('readers_club_members').delete().neq('id', '0');
  await supabase.from('readers_club_folders').delete().neq('id', '0');
  
  for (const f of folders) {
    await supabase.from('readers_club_folders').insert({ id: f.id, name: f.name, color: f.color, logo: f.logo });
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
      await supabase.from('readers_club_members').insert(mappedMembers);
    }
  }
  res.json({ success: true });
}));

// --- SOCIAL POSTS ---
app.get("/api/social/posts", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('social_posts').select('*').order('timestamp', { ascending: false });
    if (error) return handleError(res, error, "Failed to get posts");
    
    const mapped = (data || []).map((p: any) => ({
      ...p,
      studentName: p.student_name,
      className: p.class_name,
      avatarSeed: p.avatar_seed,
      bookTitle: p.book_title,
      commentsCount: p.comments_count,
      photoUrl: p.photo_url,
      likedBy: p.liked_by || []
    }));
    res.json(mapped);
  } catch (err) {
    handleError(res, err, "Failed to fetch posts from database");
  }
}));

app.post("/api/social/posts", asyncHandler(async (req, res, next) => {
  const { studentName, className, avatarSeed, bookTitle, author, rating, content, tags, photoUrl } = req.body;
  const newPost = {
    id: crypto.randomUUID(),
    student_name: studentName,
    class_name: className,
    avatar_seed: avatarSeed,
    book_title: bookTitle,
    author,
    rating,
    content,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments_count: 0,
    tags,
    photo_url: photoUrl,
    liked_by: [],
    comments: []
  };
  const { error } = await supabase.from('social_posts').insert(newPost);
  if (error) return handleError(res, error, "Failed to add post");
  res.json(newPost);
}));

app.post("/api/social/posts/:id/like", asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const { data: post, error } = await supabase.from('social_posts').select('*').eq('id', req.params.id).single();
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const likedBy = post.liked_by || [];
  let newLikes = post.likes;
  
  if (likedBy.includes(userId)) {
    likedBy.splice(likedBy.indexOf(userId), 1);
    newLikes = Math.max(0, newLikes - 1);
  } else {
    likedBy.push(userId);
    newLikes++;
  }
  
  await supabase.from('social_posts').update({ likes: newLikes, liked_by: likedBy }).eq('id', req.params.id);
  res.json({ likes: newLikes, isLiked: likedBy.includes(userId) });
}));

app.post("/api/social/posts/:id/comment", asyncHandler(async (req, res, next) => {
  const { comment, authorName, authorAvatar } = req.body;
  const { data: post, error } = await supabase.from('social_posts').select('*').eq('id', req.params.id).single();
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const comments = post.comments || [];
  const newComment = { id: crypto.randomUUID(), text: comment.text || comment, author: authorName, avatar: authorAvatar, timestamp: new Date().toISOString() };
  comments.push(newComment);
  
  await supabase.from('social_posts').update({ comments, comments_count: comments.length }).eq('id', req.params.id);
  res.json({ message: "Comment added", comment: newComment });
}));

app.delete("/api/social/posts/:id", asyncHandler(async (req, res, next) => {
  await supabase.from('social_posts').delete().eq('id', req.params.id);
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




// VITE SERVER
if (process.env.NODE_ENV !== "production") {
  createViteServer({ server: { middlewareMode: true }, appType: "spa" }).then(vite => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
}
