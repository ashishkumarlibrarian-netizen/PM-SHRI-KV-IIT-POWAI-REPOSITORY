import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  className: string;
  passwordHash: string;
  createdAt: string;
}

// Local sessions store in-memory
const sessions = new Map<string, { userId: string; expiresAt: number }>();

// Ensure database file exists
function ensureUsersFile() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
}

function readUsers(): User[] {
  ensureUsersFile();
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeUsers(users: User[]) {
  ensureUsersFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

function hashPassword(password: string): string {
  const salt = "PM_SHRI_SALT_2026";
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

// Lazy-initialization utility for Gemini API to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ----------------------------------------------------------------------------
// API Routes
// ----------------------------------------------------------------------------

// 1. Health check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    library: "PM Shri KV IIT Powai Library Hub",
  });
});

// 2. Authentication: Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, username, password, fullName, className = "" } = req.body;

    if (!email || !username || !password || !fullName) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const emailClean = email.trim().toLowerCase();
    const usernameClean = username.trim().toLowerCase();

    if (usernameClean.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const users = readUsers();

    // Check if user already exists
    if (users.find(u => u.email === emailClean)) {
      return res.status(400).json({ error: "Email already registered." });
    }
    if (users.find(u => u.username === usernameClean)) {
      return res.status(400).json({ error: "Username already taken." });
    }

    const newUser: User = {
      id: "user-" + Math.random().toString(36).substr(2, 9),
      email: emailClean,
      username: usernameClean,
      fullName: fullName.trim(),
      className: className.trim(),
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsers(users);

    // Create session
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, {
      userId: newUser.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const { passwordHash, ...userResponse } = newUser;
    res.status(201).json({
      message: "Registration successful!",
      user: userResponse,
      token,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// 3. Authentication: Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ error: "Username/Email and password are required." });
    }

    const inputClean = usernameOrEmail.trim().toLowerCase();
    const users = readUsers();

    const user = users.find(u => u.username === inputClean || u.email === inputClean);

    if (!user) {
      return res.status(400).json({ error: "Invalid username/email or password." });
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return res.status(400).json({ error: "Invalid username/email or password." });
    }

    // Create session
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const { passwordHash, ...userResponse } = user;
    res.json({
      message: "Login successful!",
      user: userResponse,
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// 4. Authentication: Get Current Profile
app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    const token = authHeader.split(" ")[1];
    const session = sessions.get(token);

    if (!session || session.expiresAt < Date.now()) {
      if (session) sessions.delete(token); // clean up expired
      return res.status(401).json({ error: "Session expired or invalid." });
    }

    const users = readUsers();
    const user = users.find(u => u.id === session.userId);

    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    const { passwordHash, ...userResponse } = user;
    res.json({ user: userResponse });
  } catch (error: any) {
    console.error("Auth check error:", error);
    res.status(500).json({ error: "Authentication check failed." });
  }
});

// 2. AI Interactive Storyteller / Choose Your Own Adventure Creator
app.post("/api/story/generate", async (req, res) => {
  try {
    const { genre, character, prompt, readingAge, currentHistory, chosenPath } = req.body;
    const ai = getAI();

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
      model: "gemini-3.5-flash",
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
    const ai = getAI();

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
      model: "gemini-3.5-flash",
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
    const ai = getAI();

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
      model: "gemini-3.5-flash",
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


// ----------------------------------------------------------------------------
// Real-time Library Wall Social Feed APIs
// ----------------------------------------------------------------------------

const SOCIAL_POSTS_FILE = path.join(process.cwd(), "data", "social_posts.json");

function ensureSocialPostsFile() {
  const dir = path.dirname(SOCIAL_POSTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(SOCIAL_POSTS_FILE)) {
    // Seed with empty array by default or basic system welcome post
    fs.writeFileSync(SOCIAL_POSTS_FILE, JSON.stringify([]));
  }
}

function readSocialPosts(): any[] {
  ensureSocialPostsFile();
  try {
    const data = fs.readFileSync(SOCIAL_POSTS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    return [];
  }
}

function writeSocialPosts(posts: any[]) {
  ensureSocialPostsFile();
  fs.writeFileSync(SOCIAL_POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

// Get all posts on the wall
app.get("/api/social/posts", (req, res) => {
  try {
    const posts = readSocialPosts();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to load library posts" });
  }
});

// Create a new post
app.post("/api/social/posts", (req, res) => {
  try {
    const { studentName, className, bookTitle, author, rating, content, tags } = req.body;
    if (!bookTitle || !content) {
      return res.status(400).json({ error: "Book title and post content are required." });
    }

    const posts = readSocialPosts();
    const newPost = {
      id: "post-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      studentName: (studentName || "Guest Scholar").trim(),
      className: (className || "Class V-A").trim(),
      avatarSeed: (studentName || "Guest").toLowerCase().replace(/\s+/g, ""),
      bookTitle: bookTitle.trim(),
      author: (author || "Unknown").trim(),
      rating: Number(rating) || 5,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' }) + " (Indian Standard Time)",
      likes: 0,
      commentsCount: 0,
      tags: tags && Array.isArray(tags) ? tags : ["KVPowaiReads"],
      comments: []
    };

    posts.unshift(newPost);
    writeSocialPosts(posts);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: "Failed to add post to library wall" });
  }
});

// Toggle post like count
app.post("/api/social/posts/:id/like", (req, res) => {
  try {
    const { id } = req.params;
    const { increment } = req.body;
    const posts = readSocialPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (increment) {
      post.likes = (post.likes || 0) + 1;
    } else {
      post.likes = Math.max(0, (post.likes || 0) - 1);
    }

    writeSocialPosts(posts);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to update likes" });
  }
});

// Add comment to a post
app.post("/api/social/posts/:id/comment", (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Comment content is required." });
    }

    const posts = readSocialPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (!post.comments) post.comments = [];
    post.comments.push(comment.trim());
    post.commentsCount = post.comments.length;

    writeSocialPosts(posts);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to post comment" });
  }
});


// ----------------------------------------------------------------------------
// Static Assets & Vite Integration
// ----------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PM SHRI KV IIT POWAI LIBRARY API] Server running on http://localhost:${PORT}`);
  });
}

startServer();
