import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import crypto from "crypto";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  className: string;
  passwordHash: string;
  createdAt: string;
  role?: string;
}

class SessionStore {
  file: string;
  constructor(file: string) {
    this.file = file;
    const dir = path.dirname(this.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "{}");
    }
  }
  get(key: string) {
    try {
      const data = JSON.parse(fs.readFileSync(this.file, "utf-8"));
      return data[key];
    } catch(e) { return undefined; }
  }
  set(key: string, value: any) {
    try {
      const data = JSON.parse(fs.readFileSync(this.file, "utf-8"));
      data[key] = value;
      fs.writeFileSync(this.file, JSON.stringify(data));
    } catch(e) {}
  }
  delete(key: string) {
    try {
      const data = JSON.parse(fs.readFileSync(this.file, "utf-8"));
      delete data[key];
      fs.writeFileSync(this.file, JSON.stringify(data));
    } catch(e) {}
  }
}

// Local sessions store file-backed
const sessions = new SessionStore(path.join(process.cwd(), "data", "sessions.json"));

// Ensure database file exists
function ensureUsersFile() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  let users: User[] = [];
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  } else {
    try {
      users = JSON.parse(fs.readFileSync(USERS_FILE, "utf-8") || "[]");
    } catch(e) {}
  }
  
  // Seed admin user
  const adminEmail = "ashishkumar.librarian@gmail.com";
  const adminIndex = users.findIndex(u => u.email === adminEmail);
  const adminHash = hashPassword("1234");
  
  if (adminIndex === -1) {
    users.push({
      id: "admin-1",
      email: adminEmail,
      username: "admin",
      fullName: "Ashish Kumar",
      className: "Staff",
      passwordHash: adminHash,
      createdAt: new Date().toISOString(),
      role: "admin"
    });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } else {
    // Reset password and ensure role
    users[adminIndex].passwordHash = adminHash;
    users[adminIndex].role = "admin";
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  }
}

// Call on startup
ensureUsersFile();

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
    const openai = getOpenAI();

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    res.json({ imageUrl: response.data[0].url });
  } catch (error: any) {
    console.error("Image generation failed:", error);
    res.status(500).json({
      error: "Unable to generate image right now.",
      details: error.message,
    });
  }
});

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
