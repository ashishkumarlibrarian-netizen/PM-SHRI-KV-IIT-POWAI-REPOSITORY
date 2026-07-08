import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Supabase client for backend (using service role to bypass RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// AI Setup
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy" });

// Dummy session store (can also be moved to Supabase if needed, but simple memory is fine for MVP)
const sessions = new Map();

// Helper for sending generic error
const handleError = (res: any, error: any, msg: string) => {
  console.error(msg, error);
  res.status(500).json({ error: msg });
};

// ... routes will go here


// --- AUTH & USERS ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, username, fullName, className, password } = req.body;
    if (!email || !username || !fullName || !password) return res.status(400).json({ error: "Missing fields" });

    // Assuming user created a "users" table manually in Supabase public schema 
    // since they said "create the complete PostgreSQL database schema for my existing project"
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    
    const { data: existingUser } = await supabase.from('users').select('id').eq('email', email).single();
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const newUser = {
      id: crypto.randomUUID(),
      email,
      username,
      full_name: fullName,
      class_name: className || "",
      password_hash: passwordHash,
      role: "student",
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('users').insert(newUser);
    if (error) return handleError(res, error, "Failed to create user");

    res.json({ message: "Registered successfully" });
  } catch (err) { handleError(res, err, "Server error"); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });
    
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    const { data: user, error } = await supabase.from('users').select('*').eq('email', email).eq('password_hash', passwordHash).single();
    
    if (error || !user) return res.status(401).json({ error: "Invalid credentials" });

    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, user.id);
    
    res.json({ token, user: { ...user, fullName: user.full_name, className: user.class_name } });
  } catch (err) { handleError(res, err, "Server error"); }
});

app.get("/api/auth/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
  
  const userId = sessions.get(token);
  const { data: user, error } = await supabase.from('users').select('*').eq('id', userId).single();
  
  if (error || !user) return res.status(401).json({ error: "User not found" });
  res.json({ user: { ...user, fullName: user.full_name, className: user.class_name } });
});

app.put("/api/user/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !sessions.has(token)) return res.status(401).json({ error: "Unauthorized" });
  
  const userId = sessions.get(token);
  const { fullName, className, avatarUrl } = req.body;
  
  const { data: user, error } = await supabase.from('users').update({ 
    full_name: fullName, 
    class_name: className, 
    avatar_url: avatarUrl 
  }).eq('id', userId).select().single();
  
  if (error) return handleError(res, error, "Failed to update profile");
  res.json({ message: "Profile updated successfully", user: { ...user, fullName: user.full_name, className: user.class_name } });
});

// --- EVENTS ---
app.get("/api/events", async (req, res) => {
  const { data, error } = await supabase.from('events').select('*').order('timestamp', { ascending: false });
  if (error) return handleError(res, error, "Failed to get events");
  // Map snake_case to camelCase
  const mapped = data.map(e => ({ ...e, imageUrl: e.image_url, videoUrl: e.video_url, mediaUrls: e.media_urls }));
  res.json(mapped);
});

app.post("/api/events", async (req, res) => {
  const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
  const newEvent = { id: crypto.randomUUID(), title, description, image_url: imageUrl, video_url: videoUrl, media_urls: mediaUrls, timestamp, created_at: new Date().toISOString() };
  const { error } = await supabase.from('events').insert(newEvent);
  if (error) return handleError(res, error, "Failed to create event");
  res.json(newEvent);
});

app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
  const { error } = await supabase.from('events').update({ title, description, image_url: imageUrl, video_url: videoUrl, media_urls: mediaUrls, timestamp }).eq('id', id);
  if (error) return handleError(res, error, "Failed to update event");
  res.json({ message: "Updated" });
});

app.delete("/api/events/:id", async (req, res) => {
  const { error } = await supabase.from('events').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete event");
  res.json({ message: "Deleted" });
});

// --- NOTICES ---
app.get("/api/notices", async (req, res) => {
  const { data, error } = await supabase.from('notices').select('*').order('date', { ascending: false });
  if (error) return handleError(res, error, "Failed to get notices");
  const mapped = data.map(n => ({ ...n, imageUrl: n.image_url, mediaUrls: n.media_urls }));
  res.json(mapped);
});

app.post("/api/notices", async (req, res) => {
  const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
  const newNotice = { id: crypto.randomUUID(), title, date, category, content, badge, priority, image_url: imageUrl, media_urls: mediaUrls, created_at: new Date().toISOString() };
  const { error } = await supabase.from('notices').insert(newNotice);
  if (error) return handleError(res, error, "Failed to create notice");
  res.json(newNotice);
});

app.put("/api/notices/:id", async (req, res) => {
  const { id } = req.params;
  const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
  const { error } = await supabase.from('notices').update({ title, date, category, content, badge, priority, image_url: imageUrl, media_urls: mediaUrls }).eq('id', id);
  if (error) return handleError(res, error, "Failed to update notice");
  res.json({ message: "Updated" });
});

app.delete("/api/notices/:id", async (req, res) => {
  const { error } = await supabase.from('notices').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete notice");
  res.json({ message: "Deleted" });
});


// --- SETTINGS / HERO IMAGES ---
// Since we don't know the exact settings table, we use bulletin_board or settings table. 
// Assuming a "settings" table with a jsonb column or just row-based.
app.get("/api/settings/hero-images", async (req, res) => {
  const { data, error } = await supabase.from('settings').select('hero_images').single();
  if (error && error.code !== 'PGRST116') return handleError(res, error, "Failed to get hero images");
  res.json({ heroImages: data?.hero_images || [] });
});

app.post("/api/settings/hero-images", async (req, res) => {
  const { heroImages } = req.body;
  // Upsert settings row (assuming id = 1)
  const { error } = await supabase.from('settings').upsert({ id: 1, hero_images: heroImages });
  if (error) return handleError(res, error, "Failed to update hero images");
  res.json({ success: true });
});

// --- STAFF ---
app.get("/api/settings/staff", async (req, res) => {
  const { data, error } = await supabase.from('staff').select('*');
  if (error) return handleError(res, error, "Failed to get staff");
  
  // Format for frontend
  const staffMembers = data.filter(s => s.type === 'staff').map(s => ({ ...s, avatarColor: s.avatar_color }));
  const editorialTeam = data.filter(s => s.type === 'editorial').map(s => ({ ...s, avatarColor: s.avatar_color }));
  res.json({ staffMembers, editorialTeam });
});

app.put("/api/settings/staff", async (req, res) => {
  const { staffMembers, editorialTeam } = req.body;
  
  // Delete all existing and insert new (simple sync approach)
  await supabase.from('staff').delete().neq('id', '0'); // Delete all
  
  const staffInserts = staffMembers.map((s: any) => ({ ...s, type: 'staff', avatar_color: s.avatarColor }));
  const editorialInserts = editorialTeam.map((s: any) => ({ ...s, type: 'editorial', avatar_color: s.avatarColor }));
  
  // Remove avatarColor from inserts to match schema
  const cleanInserts = [...staffInserts, ...editorialInserts].map((s) => {
    const { avatarColor, ...rest } = s;
    return rest;
  });
  
  const { error } = await supabase.from('staff').insert(cleanInserts);
  if (error) return handleError(res, error, "Failed to update staff");
  res.json({ success: true });
});


// --- QUIZ LINKS ---
app.get("/api/quiz-links", async (req, res) => {
  const { data, error } = await supabase.from('quiz_links').select('*');
  if (error) return handleError(res, error, "Failed to get quiz links");
  res.json(data);
});

app.post("/api/quiz-links", async (req, res) => {
  const { title, url } = req.body;
  const newLink = { id: crypto.randomUUID(), title, url, created_at: new Date().toISOString() };
  const { error } = await supabase.from('quiz_links').insert(newLink);
  if (error) return handleError(res, error, "Failed to add link");
  res.json(newLink);
});

app.delete("/api/quiz-links/:id", async (req, res) => {
  const { error } = await supabase.from('quiz_links').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete link");
  res.json({ message: "Deleted" });
});

// --- MAGAZINES ---
app.get("/api/magazines", async (req, res) => {
  const { data, error } = await supabase.from('magazines').select('*').order('date', { ascending: false });
  if (error) return handleError(res, error, "Failed to get magazines");
  const mapped = data.map(m => ({ ...m, coverColor: m.cover_color, coverImage: m.cover_image, readLink: m.read_link }));
  res.json(mapped);
});

app.post("/api/magazines", async (req, res) => {
  const { title, description, coverColor, coverImage, date, readLink } = req.body;
  const newMag = { id: crypto.randomUUID(), title, description, cover_color: coverColor, cover_image: coverImage, date, read_link: readLink, created_at: new Date().toISOString() };
  const { error } = await supabase.from('magazines').insert(newMag);
  if (error) return handleError(res, error, "Failed to add magazine");
  res.json(newMag);
});

app.put("/api/magazines/:id", async (req, res) => {
  const { title, description, coverColor, coverImage, date, readLink } = req.body;
  const { error } = await supabase.from('magazines').update({ title, description, cover_color: coverColor, cover_image: coverImage, date, read_link: readLink }).eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to update magazine");
  res.json({ message: "Updated" });
});

app.delete("/api/magazines/:id", async (req, res) => {
  const { error } = await supabase.from('magazines').delete().eq('id', req.params.id);
  if (error) return handleError(res, error, "Failed to delete magazine");
  res.json({ message: "Deleted" });
});

// --- READERS CLUB ---
app.get("/api/readers-club", async (req, res) => {
  const { data: folders, error: fError } = await supabase.from('readers_club_folders').select('*');
  const { data: members, error: mError } = await supabase.from('readers_club_members').select('*');
  if (fError || mError) return handleError(res, fError || mError, "Failed to get readers club");
  
  const mappedFolders = folders.map(f => {
    const folderMembers = members.filter(m => m.folder_id === f.id).map(m => ({
      ...m, avatarColor: m.avatar_color
    }));
    return { ...f, members: folderMembers };
  });
  res.json({ folders: mappedFolders });
});

app.post("/api/readers-club", async (req, res) => {
  const { folders } = req.body;
  // Full sync
  await supabase.from('readers_club_members').delete().neq('id', '0');
  await supabase.from('readers_club_folders').delete().neq('id', '0');
  
  for (const f of folders) {
    await supabase.from('readers_club_folders').insert({ id: f.id, name: f.name, color: f.color, logo: f.logo });
    if (f.members && f.members.length > 0) {
      const mappedMembers = f.members.map((m: any) => ({
        id: m.id, folder_id: f.id, name: m.name, role: m.role, contribution: m.contribution, grade: m.grade, avatar_color: m.avatarColor, image: m.image
      }));
      await supabase.from('readers_club_members').insert(mappedMembers);
    }
  }
  res.json({ success: true });
});


// --- SOCIAL POSTS ---
app.get("/api/social/posts", async (req, res) => {
  const { data, error } = await supabase.from('social_posts').select('*').order('timestamp', { ascending: false });
  if (error) return handleError(res, error, "Failed to get posts");
  
  const mapped = data.map(p => ({
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
});

app.post("/api/social/posts", async (req, res) => {
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
});

app.post("/api/social/posts/:id/like", async (req, res) => {
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
});

app.post("/api/social/posts/:id/comment", async (req, res) => {
  const { comment, authorName, authorAvatar } = req.body;
  const { data: post, error } = await supabase.from('social_posts').select('*').eq('id', req.params.id).single();
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const comments = post.comments || [];
  const newComment = { id: crypto.randomUUID(), text: comment.text || comment, author: authorName, avatar: authorAvatar, timestamp: new Date().toISOString() };
  comments.push(newComment);
  
  await supabase.from('social_posts').update({ comments, comments_count: comments.length }).eq('id', req.params.id);
  res.json({ message: "Comment added", comment: newComment });
});

app.delete("/api/social/posts/:id", async (req, res) => {
  await supabase.from('social_posts').delete().eq('id', req.params.id);
  res.json({ message: "Deleted" });
});

// --- AI ROUTES (MOCK or REAL) ---
app.post("/api/story/generate", async (req, res) => {
  try {
    const { genre, character, prompt, readingAge, currentHistory, chosenPath } = req.body;
    

    // Construct history context if student is already in a session
    let historyContext = "";
    if (currentHistory && Array.isArray(currentHistory) && currentHistory.length > 0) {
      historyContext = `Here is the story so far:\n` + currentHistory.map((h: any, i: number) => `Chapter ${i+1}: ${h.text}\nStudent chose: ${h.choice}`).join("\n");
    }

    let promptContent = `
You are the AI Storytelling Librarian of PM Shri Kendriya Vidyalaya IIT Powai. 
Your goal is to weave an educational, inspiring, and engaging "Choose-Your-Own-Adventure" story for a student.

Story parameters:
- Genre/Theme: ${genre || "Panchatantra Wisdom"}
- Protagonist Name/Description: ${character || "Arav, an inquisitive KV student"}
- Extra Prompt Context: ${prompt || "No extra context, surprise me!"}
- Target Audience Age / Reading Level: ${readingAge || "Juniors (Age 8-12)"}
- Current Story History Context: ${historyContext || "None. This is the start of the adventure."}
${chosenPath ? `- Next action chosen by the student: "${chosenPath}"` : ""}

Instructions:
1. Generate the next chapter or segment of the story. Use elegant, readable markdown formatting suitable for school kids. Keep the tone warm, uplifting, and aligned with PM Shri Kendriya Vidyalaya values (academic excellence, curiosity, scientific temper, and Indian heritage).
2. Since IIT Powai is located in Mumbai right next to the beautiful Sanjay Gandhi National Park, Powai Lake, and Indian Institute of Technology (IIT) campus, weave in subtle local touches if appropriate (e.g., campus monkeys, tech labs, lake breeze, scientific experiments, or cultural activities).
3. Provide exactly TWO choices for the student to continue their adventure, unless the story is ending. If the story should conclude in this chapter, make isEnd true, set choices to empty array, and summarize a beautiful moral lesson or discovery.
4. Provide a descriptive image prompt for illustrating this specific chapter.

Be creative! Generate a beautiful JSON response that strictly complies with the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptContent,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the story chapter" },
            storySegment: { type: Type.STRING, description: "Continuous story narrative with markdown formatting. Word count should be around 150-250 words." },
            illustrationPrompt: { type: Type.STRING, description: "Descriptive visual prompt fitting for a schoolbook illustration (e.g., 'A watercolor painting of...')" },
            choices: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly two interesting choice options for what the protagonist should do next. Empty array if story concludes."
            },
            isEnd: { type: Type.BOOLEAN, description: "Whether this segment is the final chapter of the story" },
          },
          required: ["title", "storySegment", "illustrationPrompt", "choices", "isEnd"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Story generation failed:", error);
    res.status(500).json({
      error: "Could not generate story right now",
      details: error.message,
    });
  }
});

// 3. AI Book Advisor & Reading Goal Advisor
app.post("/api/books/recommend", async (req, res) => {
  try {
    const { query, ageGroup, genrePreference, schoolSubject } = req.body;
    

    let recommendationPrompt = `
You are Ashish Kumar, the expert librarian of PM Shri KV IIT Powai Library.
Recommend 4 wonderful, real books (both popular Indian literature like Ruskin Bond, J.C. Bose history, Panchatantra, APJ Abdul Kalam, as well as worldwide children classics) that fit the student's interests.

Criteria:
- Student Query/Interests: "${query || "Advancing science and general curiosities"}"
- Age Group: "${ageGroup || "High School"}"
- Select Genres: "${genrePreference || "Science / Adventure"}"
- Correlated School Subject (CBSE curriculum): "${schoolSubject || "General Science / English Lit"}"

Please return an array of 4 book recommendation objects. Each object must have:
- title: Book Title
- author: Author's Name
- genre: Sub-genre or category
- description: A captivating 2-sentence hook about the plot/concept.
- whyRecommended: Tailored explanation of why this book stimulates learning for this CBSE age group.
- difficulty: One of 'Easy', 'Medium', or 'Challenging'
- funActivity: A creative, hands-on activity the student can do after reading (e.g. 'Create your own homemade kaleidoscope' or 'Write a letter to your future self in 2035').

Return a JSON array strictly complying with the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: recommendationPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              genre: { type: Type.STRING },
              description: { type: Type.STRING },
              whyRecommended: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              funActivity: { type: Type.STRING },
            },
            required: ["title", "author", "genre", "description", "whyRecommended", "difficulty", "funActivity"],
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text || "[]");
    res.json({ recommendations: parsedData });
  } catch (error: any) {
    console.error("Book recommendation failed:", error);
    res.status(500).json({
      error: "Book suggestions currently unavailable.",
      details: error.message,
    });
  }
});

// 4. Student Creative Zone: Poem & Creative Writing Review Coach
app.post("/api/creative/write", async (req, res) => {
  try {
    const { topic, formType, mood, userKeywords } = req.body;
    

    const creativePrompt = `
You are the Creative Writing Mentor for PM Shri KV IIT Powai Library.
Compose a beautiful piece of literature to inspire students, based on their input:
- Topic: ${topic || "Rain over Powai Lake"}
- Form Type: ${formType || "Poem"} (e.g., Rhyme Poem, Haiku, Starting Lines for a Mystery Novel, Inspiring Quote)
- Mood: ${mood || "Uplifting and Joyful"}
- Student's keywords to include: "${userKeywords || "monkeys, raindrops, knowledge"}"

Provide:
1. A unique, beautifully formatted Title.
2. The core creative piece (using beautiful line breaks if poetry, or paragraphs).
3. 3 "Mentor Tidbits" or educational tips that explain the literary devices used (like personification, rhyme schemes, or metaphors), teaching students how to write like this themselves.

Format the response strictly as a JSON object adhering to the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: creativePrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            output: { type: Type.STRING, description: "The full literary piece with formatting" },
            educationalTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Three helpful, child-friendly insights explaining literary elements used."
            }
          },
          required: ["title", "output", "educationalTips"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Creative writing agent failed:", error);
    res.status(500).json({
      error: "Unable to craft creative piece right now.",
      details: error.message,
    });
  }
});


// Lazy-initialization utility for OpenAI API
let openaiClient: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY environment variable is required but missing.");
    }
    openaiClient = new OpenAI({
      apiKey: key,
    });
  }
  return openaiClient;
}

// ----------------------------------------------------------------------------
// Real-time Library Wall Social Feed APIs
// ----------------------------------------------------------------------------

const EVENTS_FILE = path.join(process.cwd(), "data", "events.json");

function ensureEventsFile() {
  const dir = path.dirname(EVENTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(EVENTS_FILE)) {
    fs.writeFileSync(EVENTS_FILE, JSON.stringify([]));
  }
}

function readEvents(): any[] {
  ensureEventsFile();
  try {
    const data = fs.readFileSync(EVENTS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeEvents(events: any[]) {
  ensureEventsFile();
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf-8");
}

const NOTICES_FILE = path.join(process.cwd(), "data", "notices.json");

function ensureNoticesFile() {
  const dir = path.dirname(NOTICES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(NOTICES_FILE)) {
    // Initial static notices if none exist
    const initialNotices = [
      {
        id: "1",
        title: "PUSTAKOUPHAR: Gift a Book, Share a Smile!",
        date: "April 01, 2026 - April 05, 2026",
        category: "Activity",
        content: "If you do not find a taker, deposit your books in the Library Green Book Bank. If you are looking for a gift (of books), get it from a student of your class or from the Library Green Book Bank. Old Books Can Shape Someone's Future.",
        badge: "Book Drive",
        priority: "High",
        imageUrl: "/pustakouphar.jpeg"
      },
      {
        id: "2",
        title: "PM Shri e-Learning Corner Inaugration",
        date: "June 20, 2026",
        category: "PM-Shri",
        content: "We are thrilled to unveil our new AI-enabled interactive e-Learning desks, funded under the prestigious PM Shri School development project. Students can now access personalized AI reading guides, digital encyclopedias, and creative writing widgets.",
        badge: "NEP 2020",
        priority: "Normal"
      },
      {
        id: "3",
        title: "National Reading Week: Book Review contest",
        date: "June 25, 2026",
        category: "Competition",
        content: "Participate in our annual review writing competition. Stand a chance to get your reviews published in the KV Powai Web Journal and win glorious titles like 'Master Literati' and book coupons. Submit your review in the Student Creative Hub tab!",
        badge: "Competition",
        priority: "Normal"
      },
      {
        id: "4",
        title: "IIT Powai Guest Lecture: 'The Universe in a Library'",
        date: "July 02, 2026",
        category: "Activity",
        content: "Join us for a stimulating talk in the Library Seminar Hall by Prof. Dr. S. Ramachandran from IIT Bombay (Powai). He will discuss how science, philosophy, and books expand our cosmos. Open for Standards IX to XII.",
        badge: "Special Event",
        priority: "Normal"
      }
    ];
    fs.writeFileSync(NOTICES_FILE, JSON.stringify(initialNotices, null, 2));
  }
}

function readNotices(): any[] {
  ensureNoticesFile();
  try {
    const data = fs.readFileSync(NOTICES_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeNotices(notices: any[]) {
  ensureNoticesFile();
  fs.writeFileSync(NOTICES_FILE, JSON.stringify(notices, null, 2), "utf-8");
}

const SETTINGS_FILE = path.join(process.cwd(), "data", "settings.json");

const STAFF_FILE = path.join(process.cwd(), "data", "staff.json");

const defaultStaff = {
  staffMembers: [
    {
      id: "1",
      name: "Ashish Kumar",
      role: "Librarian & Senior IT Head",
      contribution: "Spearheaded the digital library initiative and cultivated a thriving reading culture among students.",
      avatarColor: "bg-indigo-100 text-indigo-700",
      years: "25+ Years",
      image: "/ashish-kumar.jpeg"
    }
  ],
  editorialTeam: [
    {
      id: "e1",
      name: "Editorial Member",
      role: "Editor-in-Chief",
      contribution: "Leads the curation and editing of the library magazine.",
      avatarColor: "bg-emerald-100 text-emerald-700",
      years: "1+ Years",
      image: ""
    }
  ]
};

function readStaff() {
  if (fs.existsSync(STAFF_FILE)) {
    return JSON.parse(fs.readFileSync(STAFF_FILE, "utf-8"));
  }
  return defaultStaff;
}

function writeStaff(data: any) {
  fs.writeFileSync(STAFF_FILE, JSON.stringify(data, null, 2));
}


function ensureSettingsFile() {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SETTINGS_FILE)) {
    const initialSettings = {
      heroImages: []
    };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(initialSettings, null, 2));
  }
}

function readSettings(): any {
  ensureSettingsFile();
  try {
    const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
    return JSON.parse(data || "{}");
  } catch (err) {
    return { heroImages: [] };
  }
}

function writeSettings(settings: any) {
  ensureSettingsFile();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
}

app.get("/api/settings/hero-images", (req, res) => {
  try {
    const settings = readSettings();
    res.json(settings.heroImages || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to load hero images" });
  }
});

app.post("/api/settings/hero-images", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { images } = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({ error: "Images must be an array." });
    }

    const settings = readSettings();
    settings.heroImages = images;
    writeSettings(settings);
    res.json(settings.heroImages);
  } catch (err) {
    res.status(500).json({ error: "Failed to update hero images" });
  }
});

app.get("/api/notices", (req, res) => {
  try {
    const notices = readNotices();
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to load notices" });
  }
});

app.post("/api/notices", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const notices = readNotices();
    const newNotice = {
      id: Date.now().toString(),
      title,
      date: date || new Date().toISOString().split('T')[0],
      category: category || "General",
      content,
      badge: badge || "",
      priority: priority || "Normal",
      imageUrl: imageUrl || "",
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : (imageUrl ? [imageUrl] : [])
    };

    notices.unshift(newNotice);
    writeNotices(notices);
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(500).json({ error: "Failed to create notice" });
  }
});

app.put("/api/notices/:id", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { id } = req.params;
    const { title, date, category, content, badge, priority, imageUrl, mediaUrls } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const notices = readNotices();
    const noticeIndex = notices.findIndex(n => n.id === id);
    if (noticeIndex === -1) {
      return res.status(404).json({ error: "Notice not found." });
    }

    notices[noticeIndex] = {
      ...notices[noticeIndex],
      title,
      date: date || notices[noticeIndex].date,
      category: category || notices[noticeIndex].category,
      content,
      badge: badge !== undefined ? badge : notices[noticeIndex].badge,
      priority: priority || notices[noticeIndex].priority,
      imageUrl: imageUrl !== undefined ? imageUrl : notices[noticeIndex].imageUrl,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : notices[noticeIndex].mediaUrls || []
    };

    writeNotices(notices);
    res.json(notices[noticeIndex]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update notice" });
  }
});

app.delete("/api/notices/:id", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { id } = req.params;
    const notices = readNotices();
    const updatedNotices = notices.filter(n => n.id !== id);
    
    if (notices.length === updatedNotices.length) {
      return res.status(404).json({ error: "Notice not found." });
    }

    writeNotices(updatedNotices);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notice" });
  }
});

app.get("/api/events", (req, res) => {
  try {
    const events = readEvents();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to load events" });
  }
});

app.post("/api/events", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required." });
    }

    const events = readEvents();
    const newEvent = {
      id: "event-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl?.trim() || null,
      videoUrl: videoUrl?.trim() || null,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
      timestamp: timestamp || new Date().toISOString()
    };

    events.unshift(newEvent);
    writeEvents(events);
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to create event" });
  }
});

app.put("/api/events/:id", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { id } = req.params;
    const { title, description, imageUrl, videoUrl, mediaUrls, timestamp } = req.body;
    
    const events = readEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return res.status(404).json({ error: "Event not found." });
    }

    events[eventIndex] = {
      ...events[eventIndex],
      title: title ? title.trim() : events[eventIndex].title,
      description: description ? description.trim() : events[eventIndex].description,
      imageUrl: imageUrl !== undefined ? imageUrl : events[eventIndex].imageUrl,
      videoUrl: videoUrl !== undefined ? videoUrl : events[eventIndex].videoUrl,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : events[eventIndex].mediaUrls || [],
      timestamp: timestamp || events[eventIndex].timestamp
    };

    writeEvents(events);
    res.json(events[eventIndex]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.delete("/api/events/:id", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }
    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      return res.status(401).json({ error: "Session expired or invalid." });
    }
    const users = readUsers();
    const user = users.find(u => u.id === session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }

    const { id } = req.params;
    const events = readEvents();
    const updatedEvents = events.filter(e => e.id !== id);
    
    if (events.length === updatedEvents.length) {
      return res.status(404).json({ error: "Event not found." });
    }

    writeEvents(updatedEvents);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event" });
  }
});

app.post("/api/creative/image", async (req, res) => {
  try {
    const { prompt } = req.body;
    

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });
    res.json({ imageUrl: response.data[0].url });
  } catch (err) { handleError(res, err, "AI error"); }
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
