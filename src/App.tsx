import React, { useState, useEffect } from "react";
import kvLogo from "./assets/images/kv_logo_1782202542204.jpg";
import {
  BookOpen,
  Sparkles,
  Award,
  MessageSquare,
  Heart,
  Send,
  Volume2,
  VolumeX,
  RefreshCw,
  Search,
  Compass,
  ChevronRight,
  Bookmark,
  MapPin,
  School,
  Hash,
  User,
  CheckCircle2,
  ArrowRight,
  PenTool,
  HelpCircle,
  Calendar,
  Flame,
  LayoutGrid,
  Maximize2,
  BookOpenCheck,
  ExternalLink,
  Moon,
  Sun,
  Library,
  Instagram,
  Youtube,
  Twitter,
  Facebook,
  Users,
  Radio,
  Bell,
  Menu,
  BookMarked,
  Globe,
  Share2,
  Linkedin,
  Layers,
  X,
} from "lucide-react";
import WelcomeTab from "./components/WelcomeTab";
import MenuTab from "./components/MenuTab";
import MagazineTab from "./components/MagazineTab";
import StaffTab from "./components/StaffTab";
import ReadersClubTab from "./components/ReadersClubTab";
import {
  StoryChapter,
  BookRecommendation,
  SocialFeedPost,
  SavedStory,
  User as UserType,
  RecentBook,
} from "./types";
import { motion, AnimatePresence } from "motion/react";
import AuthModal from "./components/AuthModal";
import { RECENT_BOOKS_DATA } from "./data/recentBooks";

// Initial Mock Social Posts for simulation
const INITIAL_SOCIAL_POSTS: SocialFeedPost[] = [];

export default function App() {
  const validTabs = ["dashboard", "story", "books", "creative", "social", "menu", "magazine", "readers-club", "staff"] as const;
  type TabType = typeof validTabs[number];

  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      return validTabs.includes(tab as any) ? (tab as TabType) : "dashboard";
    } catch (e) {
      return "dashboard";
    }
  });

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    try {
      const newUrl = `${window.location.pathname}?tab=${tab}${window.location.hash}`;
      window.history.pushState({ tab }, "", newUrl);
    } catch (e) {}
  };

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        setActiveTabState(validTabs.includes(tab as any) ? (tab as TabType) : "dashboard");
      } catch (e) {}
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Theme state for light and dark mode toggling
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("kv_library_theme");
      return saved === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("kv_library_theme", theme);
    } catch (e) {}
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  // Real authentication states
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleAuthSuccess = (user: UserType, token: string) => {
    setCurrentUser(user);
    setStudentName(user.fullName);
    setStudentClass(user.className);
    try {
      localStorage.setItem("kv_library_token", token);
      localStorage.setItem("kv_library_user", JSON.stringify(user));
    } catch (e) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setStudentName("Guest Scholar");
    setStudentClass("Class V-A");
    if (activeTab === "story" || activeTab === "creative") {
      setActiveTab("dashboard");
    }
    try {
      localStorage.removeItem("kv_library_token");
      localStorage.removeItem("kv_library_user");
    } catch (e) {}
  };

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("kv_library_token");
      const savedUserStr = localStorage.getItem("kv_library_user");
      if (savedToken && savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          setCurrentUser(savedUser);
          setStudentName(savedUser.fullName);
          setStudentClass(savedUser.className);
        } catch (e) {
          localStorage.removeItem("kv_library_token");
          localStorage.removeItem("kv_library_user");
        }
      } else {
        setStudentName("Guest Scholar");
        setStudentClass("Class V-A");
      }
    } catch (e) {
      setStudentName("Guest Scholar");
      setStudentClass("Class V-A");
    }
  }, []);

  // Choose Your Own Adventure (AI Storytelling States)
  const [storyGenre, setStoryGenre] = useState("Panchatantra Wisdom");
  const [protagonist, setProtagonist] = useState("Aarav the Explorer");
  const [customProtagonist, setCustomProtagonist] = useState("");
  const [storyPromptText, setStoryPromptText] = useState("");
  const [readingLevel, setReadingLevel] = useState("Middle School (Age 11-14)");

  const [storyHistory, setStoryHistory] = useState<
    { segment: string; choiceMade?: string }[]
  >([]);
  const [currentChapter, setCurrentChapter] = useState<StoryChapter | null>(
    null,
  );
  const [isStoryLoading, setIsStoryLoading] = useState(false);
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);

  // Audio narration state
  const [isNarrating, setIsNarrating] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(false);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);

  // Recent Books Catalog States
  const [recentBooksList, setRecentBooksList] =
    useState<RecentBook[]>(RECENT_BOOKS_DATA);
  const [booksSearchQuery, setBooksSearchQuery] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState("All");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [savedFavoritesMap, setSavedFavoritesMap] = useState<
    Record<string, boolean>
  >({});
  const [bookReservationSuccess, setBookReservationSuccess] = useState<
    string | null
  >(null);
  const [followedHandles, setFollowedHandles] = useState<
    Record<string, boolean>
  >({});
  const [socialAlertMessage, setSocialAlertMessage] = useState<string | null>(
    null,
  );

  // Creative Studio
  const [creativeTopic, setCreativeTopic] = useState("Rains Over Powai Lake");
  const [creativeForm, setCreativeForm] = useState("Poem");
  const [creativeMood, setCreativeMood] = useState("Inspiring & Scientific");
  const [creativeKeywords, setCreativeKeywords] = useState(
    "IIT gates, raindrops, books, discovery",
  );
  const [creativeResult, setCreativeResult] = useState<{
    title: string;
    output: string;
    educationalTips: string[];
  } | null>(null);
  const [creativeImageUrl, setCreativeImageUrl] = useState<string | null>(null);
  const [includeAIImage, setIncludeAIImage] = useState(false);
  const [isCreativeLoading, setIsCreativeLoading] = useState(false);

  // Social Feed Simulation
  const [socialPosts, setSocialPosts] =
    useState<SocialFeedPost[]>(INITIAL_SOCIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostBookTitle, setNewPostBookTitle] = useState("");
  const [newPostAuthor, setNewPostAuthor] = useState("");
  const [newPostRating, setNewPostRating] = useState(5);
  const [newPostTags, setNewPostTags] = useState("");
  const [studentName, setStudentName] = useState("Guest Scholar");
  const [studentClass, setStudentClass] = useState("Class V-A");
  const [postLikesMap, setPostLikesMap] = useState<Record<string, boolean>>({});
  const [postCommentsMap, setPostCommentsMap] = useState<
    Record<string, string[]>
  >({});
  const [commentInputMap, setCommentInputMap] = useState<
    Record<string, string>
  >({});

  // Fetch Speech Synthesis Voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSynthesisActive(true);
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Default to an English voice that sounds natural
        const defaultVoice =
          voices.find(
            (v) => v.lang.includes("en-IN") || v.lang.includes("en-US"),
          ) || voices[0];
        if (defaultVoice) setSelectedVoiceName(defaultVoice.name);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Stop any ongoing narration when changing chapters or screens
  useEffect(() => {
    stopNarration();
  }, [activeTab, currentChapter]);

  // Load real social posts from the KV Powai Wall backend
  const fetchSocialPosts = () => {
    fetch("/api/social/posts")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load posts");
      })
      .then((data: any[]) => {
        setSocialPosts(data);
        // Populate comment maps
        const commentsMap: Record<string, string[]> = {};
        data.forEach((post) => {
          if (post.comments) {
            commentsMap[post.id] = post.comments;
          }
        });
        setPostCommentsMap(commentsMap);
      })
      .catch((err) => {
        console.error("Could not load library wall posts:", err);
      });
  };

  useEffect(() => {
    fetchSocialPosts();
  }, []);

  const narrateStory = (text: string) => {
    if (!speechSynthesisActive || typeof window === "undefined") return;

    stopNarration();

    // Clean markdown before speaking
    const cleanText = text.replace(/[*#_`]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const selectedVoice = availableVoices.find(
      (v) => v.name === selectedVoiceName,
    );
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsNarrating(false);
    };
    utterance.onerror = () => {
      setIsNarrating(false);
    };

    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopNarration = () => {
    if (speechSynthesisActive && typeof window !== "undefined") {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  };

  // Start Choose Your Own Adventure
  const handleStartAdventure = async () => {
    setIsStoryLoading(true);
    setCurrentChapter(null);
    setStoryHistory([]);
    stopNarration();

    try {
      const charName = customProtagonist.trim() || protagonist;
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: storyGenre,
          character: charName,
          prompt: storyPromptText,
          readingAge: readingLevel,
          currentHistory: [],
        }),
      });

      if (!res.ok) throw new Error("Server response not ok");
      const data = await res.json();
      setCurrentChapter(data);
    } catch (e) {
      console.error(e);
      // Beautiful fallback system
      setCurrentChapter({
        title: "The Mysterious Spark in Powai Lab",
        storySegment: `**Chapter 1:** An inquisitive student named **${customProtagonist.trim() || protagonist}** was studying late in the PM Shri KV library when they noticed a strange pulsing green spark radiating from a shelf marked *'Advanced Space Engineering'*. \n\nAs the night breeze swept over Powai Lake and through the laboratory windows, the student took a step closer. A gentle mechanical whisper echoed: *"Unlock the cipher to begin your quest."*`,
        illustrationPrompt:
          "A cozy high school library corner in Mumbai, glowing blue book, tropical palms outside, sunset cozy light",
        choices: [
          "Curiously open the ancient-looking manual with the glowing circuit symbol",
          "Immediately report it to the security desk near the science department",
        ],
        isEnd: false,
      });
    } finally {
      setIsStoryLoading(false);
    }
  };

  // Advance Choose Your Own Adventure
  const handleChoosePath = async (choiceText: string) => {
    if (!currentChapter) return;
    setIsStoryLoading(true);
    stopNarration();

    const updatedHistory = [
      ...storyHistory,
      { segment: currentChapter.storySegment, choiceMade: choiceText },
    ];
    setStoryHistory(updatedHistory);

    try {
      const charName = customProtagonist.trim() || protagonist;
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: storyGenre,
          character: charName,
          prompt: storyPromptText,
          readingAge: readingLevel,
          currentHistory: updatedHistory,
          chosenPath: choiceText,
        }),
      });

      if (!res.ok) throw new Error("Server response not ok");
      const data = await res.json();
      setCurrentChapter(data);
    } catch (e) {
      console.error(e);
      // Fallback response generator
      const isFin = updatedHistory.length >= 3;
      setCurrentChapter({
        title: isFin
          ? "The Dawn of Cosmic Discovery"
          : "Deep in the Tech Labyrinth",
        storySegment: isFin
          ? `**Conclusion:** By choosing "${choiceText}", you successfully aligned the telemetry matrix! A majestic holographic map of India's future rockets arose. You learned that true science blossoms from courageous curiosity and deep respect for the keepers of knowledge. You returned to PM Shri KV Powai as a fully accredited junior space scholar!`
          : `**Next Stage:** Your decision to "${choiceText}" led you to an intriguing basement annex beneath the IIT. On the counter lay an experimental quantum device and an ancient slate. The air shimmered. Realizing this solved the old riddle of Powai Lake, you paced yourself.`,
        illustrationPrompt:
          "Water painting of an Indian student holding a shiny digital notebook, background with stars",
        choices: isFin
          ? []
          : [
              "Attempt to connect the device to your library e-reader tool",
              "Read aloud the Vedic Sanskrit verses etched on the metallic plate",
            ],
        isEnd: isFin,
      });
    } finally {
      setIsStoryLoading(false);
    }
  };

  // Saved Story Trigger
  const handleSaveCurrentStory = () => {
    if (!currentChapter) return;
    const newStory: SavedStory = {
      id: "saved-" + Date.now(),
      title: currentChapter.title || "My Quest at IIT Powai",
      genre: storyGenre,
      character: customProtagonist.trim() || protagonist,
      chapters: [...storyHistory, { segment: currentChapter.storySegment }],
      date: new Date().toLocaleDateString(),
    };
    setSavedStories([newStory, ...savedStories]);
    alert(
      "Superb! Your adventure has been preserved in the Library digital logbook.",
    );
  };

  // Toggle book as Favorite
  const handleToggleFavoriteBook = (bookId: string) => {
    setSavedFavoritesMap((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  // Reserve a recent book
  const handleReserveBook = (bookId: string) => {
    const bookIndex = recentBooksList.findIndex((b) => b.id === bookId);
    if (bookIndex === -1) return;

    const book = recentBooksList[bookIndex];

    if (book.status === "Reserved") {
      setBookReservationSuccess(
        `This copy of "${book.title}" is already reserved by another reader.`,
      );
      setTimeout(() => setBookReservationSuccess(null), 5000);
      return;
    }
    if (book.status === "Reference Only") {
      setBookReservationSuccess(
        `"${book.title}" is a Reference-Only book and cannot be checked out outside the library.`,
      );
      setTimeout(() => setBookReservationSuccess(null), 5000);
      return;
    }

    // Update state to Reserved in local list
    const updatedList = [...recentBooksList];
    updatedList[bookIndex] = {
      ...book,
      status: "Reserved",
    };
    setRecentBooksList(updatedList);

    const borrowerInfo = currentUser
      ? currentUser.fullName
      : `${studentName} (Guest)`;
    setBookReservationSuccess(
      `🎉 SUCCESS: "${book.title}" has been successfully reserved for ${borrowerInfo}! Please collect from Coordinator Shri Ashish Kumar at Rack ${book.rackLocation}.`,
    );

    // Auto-remove notification after few seconds
    setTimeout(() => {
      setBookReservationSuccess(null);
    }, 8000);
  };

  // Creative Writer Engine
  const generateCreativeContent = async () => {
    setIsCreativeLoading(true);
    setCreativeResult(null);
    setCreativeImageUrl(null);
    try {
      const creativeRes = await fetch("/api/creative/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: creativeTopic,
          formType: creativeForm,
          mood: creativeMood,
          userKeywords: creativeKeywords,
        }),
      });

      if (!creativeRes.ok) throw new Error("Server not ok");
      const data = await creativeRes.json();
      setCreativeResult(data);

      if (includeAIImage) {
        const imgRes = await fetch("/api/creative/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `A beautiful and creative illustration for a ${creativeForm} titled "${data.title}" about ${creativeTopic}. Mood: ${creativeMood}. Style: high quality, child-friendly, inspiring, vibrant.`,
          }),
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          if (imgData.imageUrl) {
            setCreativeImageUrl(imgData.imageUrl);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setCreativeResult({
        title: `${creativeMood} ${creativeForm} on ${creativeTopic}`,
        output: `A gentle sheet of cool monsoon fog ascends,\nWhere the historic gates of IIT Powai stand proud.\nRaindrops whisper upon young backpacks,\nAs science and dreams meet in books under the clouds.\n\nMonkeys chatter happily in the canopy green,\nWhile computer screens flicker with scripts clean.\nNever-ending search for wisdom, pure and bright,\nNurtures hearts at PM Shri KV in pristine light.`,
        educationalTips: [
          "Uses **Imagery**: Phrases like 'cool monsoon fog' and 'shimmering lakes' help create vivid mental pictures.",
          "Features **Internal Rhyme**: Fosters musicality in reading, making it memorable for presentation.",
          "Maintains **Thematic Integration**: Seamlessly blends modern computer science with beautiful tropical nature.",
        ],
      });
    } finally {
      setIsCreativeLoading(false);
    }
  };

  // Social Wall Functions
  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostBookTitle.trim()) return;

    const tagsArray = newPostTags
      ? newPostTags.split(",").map((t) => t.trim().replace(/^#/, ""))
      : ["KVPowaiReads"];

    fetch("/api/social/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: studentName.trim() || "Young Scholar",
        className: studentClass || "Class X-A",
        bookTitle: newPostBookTitle.trim(),
        author: newPostAuthor.trim() || "Unknown Author",
        rating: newPostRating,
        content: newPostContent.trim(),
        tags: tagsArray,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to create post");
      })
      .then((createdPost) => {
        setSocialPosts((prev) => [createdPost, ...prev]);
        setNewPostContent("");
        setNewPostBookTitle("");
        setNewPostAuthor("");
        setNewPostTags("");
      })
      .catch((err) => {
        console.error("Failed to post: ", err);
      });
  };

  const handleLikePost = (postId: string) => {
    const isLiked = !!postLikesMap[postId];

    // Optimistic UI update
    setSocialPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, likes: p.likes + (isLiked ? -1 : 1) };
        }
        return p;
      }),
    );
    setPostLikesMap((prev) => ({ ...prev, [postId]: !isLiked }));

    // Send update to server
    fetch(`/api/social/posts/${postId}/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ increment: !isLiked }),
    }).catch((err) => {
      console.error("Failed to sync like with server:", err);
    });
  };

  const handleAddComment = (postId: string) => {
    const commentText = commentInputMap[postId] || "";
    if (!commentText.trim()) return;

    const key = postId;
    const existingComments = postCommentsMap[key] || [];
    const formattedComment = `${studentName}: ${commentText.trim()}`;
    const updatedComments = [...existingComments, formattedComment];

    // Immediate UI response
    setPostCommentsMap((prev) => ({ ...prev, [key]: updatedComments }));
    setCommentInputMap((prev) => ({ ...prev, [key]: "" }));
    setSocialPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, commentsCount: updatedComments.length };
        }
        return p;
      }),
    );

    // Save to database
    fetch(`/api/social/posts/${postId}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: formattedComment }),
    }).catch((err) => {
      console.error("Failed to save comment to server:", err);
    });
  };

  // Toggle official social platform tracking follow status
  const handleToggleFollow = (platform: string, handleName: string) => {
    const isCurrentlyFollowing = !!followedHandles[platform];
    setFollowedHandles((prev) => ({
      ...prev,
      [platform]: !isCurrentlyFollowing,
    }));

    if (!isCurrentlyFollowing) {
      setSocialAlertMessage(
        `🎉 Hurrah! You are now subscribed to PM Shri KV IIT Powai Library updates on ${platform} (${handleName}). New alerts will be notified here.`,
      );
    } else {
      setSocialAlertMessage(`Muted alerts from official ${platform} feed.`);
    }

    setTimeout(() => {
      setSocialAlertMessage(null);
    }, 6000);
  };

  // Filter core recent books list
  const filteredRecentBooks = recentBooksList.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(booksSearchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(booksSearchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(booksSearchQuery.toLowerCase());

    const matchesGenre =
      selectedGenreFilter === "All" || book.genre.includes(selectedGenreFilter);

    const matchesGrade =
      selectedGradeFilter === "All" ||
      (selectedGradeFilter === "Primary" &&
        book.gradeLevel.includes("Primary")) ||
      (selectedGradeFilter === "Middle" &&
        book.gradeLevel.includes("Middle")) ||
      (selectedGradeFilter === "High" && book.gradeLevel.includes("High")) ||
      (selectedGradeFilter === "Secondary" &&
        book.gradeLevel.includes("Secondary"));

    const matchesStatus =
      selectedStatusFilter === "All" || book.status === selectedStatusFilter;

    return matchesSearch && matchesGenre && matchesGrade && matchesStatus;
  });

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "dark bg-slate-950 text-slate-100" : "bg-[#f8fafc] text-indigo-950"} font-sans flex flex-col antialiased transition-colors duration-300`}
    >
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Welcome to the PM SHRI KV IIT Powai Library
                </h2>
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4 text-sm md:text-base leading-relaxed">
                <p>
                  Welcome to the official digital gateway of the <strong>PM SHRI KV IIT Powai Library</strong>. Our library is a vibrant centre of knowledge, learning, and discovery, committed to nurturing intellectual curiosity, creativity, and a lifelong love for reading. We strive to provide a welcoming and inclusive environment where every student is encouraged to explore ideas, develop critical thinking skills, and grow into confident, informed learners.
                </p>
                <p>
                  Our collection of books, digital resources, journals, and educational materials is carefully curated to support academic excellence as well as personal enrichment. Beyond providing access to information, the library serves as a dynamic learning space that promotes innovation, collaboration, and independent inquiry.
                </p>
                <p>
                  Through this website, you can explore our library services, discover new arrivals, access digital resources, participate in reading initiatives, and stay updated with the latest events, activities, and announcements. We warmly invite students, teachers, parents, and visitors to make the most of the opportunities our library offers.
                </p>
                <p className="font-medium text-indigo-700 dark:text-indigo-400">
                  Together, let us celebrate the joy of reading, the pursuit of knowledge, and the spirit of lifelong learning.
                </p>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
                >
                  Enter Library
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PM Shri Premium Bento Nav Header */}
      <header
        id="app-bento-header"
        className="h-16 md:h-18 sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-indigo-900/50 text-white shadow-md px-3 md:px-8 flex items-center justify-between gap-2 transition-all duration-300"
      >
        <div className="flex items-center gap-2 md:gap-3 flex-shrink min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white overflow-hidden border border-slate-700/50 shadow flex-shrink-0">
            <img
              src={kvLogo}
              alt="PM Shri KV IIT Powai Library Logo"
              title="PM Shri KV IIT Powai Library"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
              <span className="text-[9px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans tracking-wide whitespace-nowrap flex-shrink-0">
                <span className="md:hidden">PM SHRI</span>
                <span className="hidden md:inline">PM SHRI SCHOOL</span>
              </span>
              <span className="hidden sm:inline text-[10px] md:text-[11px] font-mono text-cyan-400 whitespace-nowrap truncate min-w-0">
                IIT POWAI SECTOR
              </span>
            </div>
            <h1 className="text-xs sm:text-sm md:text-lg font-bold leading-none tracking-tight text-white mt-1 truncate">
              KV IIT Powai Digital Library Hub
            </h1>
          </div>
        </div>

        {/* Navigation Tabs aligned horizontally */}
        <nav className="hidden 2xl:flex items-center gap-1.5 text-xs font-semibold flex-shrink-0">
          {[
            { id: "dashboard", label: "Bulletin & Desk", icon: <LayoutGrid className="w-4 h-4" /> },
            ...(currentUser ? [{ id: "story", label: "AI Interactive Storyteller", icon: <Sparkles className="w-4 h-4" /> }] : []),
            { id: "books", label: "Recent Books", icon: <BookOpen className="w-4 h-4" /> },
            ...(currentUser ? [{ id: "creative", label: "Creative Hub", icon: <PenTool className="w-4 h-4" /> }] : []),
            { id: "social", label: "Social Hub", icon: <MessageSquare className="w-4 h-4" /> },
            { id: "magazine", label: "Magazine", icon: <BookMarked className="w-4 h-4" /> },
            { id: "readers-club", label: "Reader's Club", icon: <Users className="w-4 h-4" /> },
            { id: "staff", label: "Staff", icon: <Users className="w-4 h-4" /> },
            { id: "menu", label: "Menu", icon: <Menu className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 group ${
                activeTab === tab.id
                  ? "text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="nav-desktop-pill" 
                  className="absolute inset-0 bg-amber-500 rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {tab.icon} {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Quick User Badge */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex flex-col text-right animate-fade-in">
                <span className="text-xs font-bold text-amber-400">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                  ✓ Registered Student
                </span>
              </div>
              <button
                onClick={handleLogout}
                id="header-logout-btn"
                className="px-2 md:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 hover:text-red-400 text-slate-300 rounded-lg text-[10px] md:text-[11px] font-bold transition-all border border-slate-700 font-sans"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-amber-500 font-sans">
                  Guest Scholar
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Offline session
                </span>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                id="header-login-btn"
                className="px-2 md:px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-md hover:shadow-amber-500/10 hover:border-amber-400 border border-amber-500 whitespace-nowrap"
              >
                Sign In
              </button>
            </div>
          )}
          <button
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            id="theme-toggle-btn"
            aria-label="Toggle light and dark theme"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            className="p-1.5 md:p-2.5 bg-slate-800 hover:bg-slate-700 hover:text-amber-300 text-amber-400 rounded-lg md:rounded-xl border border-slate-700 transition-all active:scale-95 flex items-center justify-center shadow-md cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 md:w-4.5 md:h-4.5" />
            ) : (
              <Moon className="w-4 h-4 md:w-4.5 md:h-4.5" />
            )}
          </button>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-900 border border-amber-300">
            🎓
          </div>
        </div>
      </header>

      {/* Tab Navigation for Mobile Systems */}
      <div className="2xl:hidden bg-slate-800 text-slate-100 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-indigo-950">
        <div className="flex px-4 py-2 gap-2 text-xs">
          {[
            { id: "dashboard", label: "Bulletin", icon: null },
            ...(currentUser ? [{ id: "story", label: "✨ AI Storytelling", icon: null }] : []),
            { id: "books", label: "📖 Recent Books", icon: null },
            ...(currentUser ? [{ id: "creative", label: "✍️ Writing Lab", icon: null }] : []),
            { id: "social", label: "💬 Social Wall", icon: null },
            { id: "magazine", label: "Magazine", icon: <BookMarked className="w-3.5 h-3.5" /> },
            { id: "readers-club", label: "Reader's Club", icon: <Users className="w-3.5 h-3.5" /> },
            { id: "staff", label: "Staff", icon: <Users className="w-3.5 h-3.5" /> },
            { id: "menu", label: "Menu", icon: <Menu className="w-3.5 h-3.5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-4 py-2 rounded-full font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === tab.id ? "text-slate-900" : "bg-slate-700/50 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="nav-mobile-pill" 
                  className="absolute inset-0 bg-amber-500 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1">
                {tab.icon} {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Profile setup bar */}
      <section className="bg-amber-500/5 dark:bg-slate-900/30 border-b border-amber-500/10 dark:border-slate-800 py-2 px-4 md:px-8 text-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          {currentUser ? (
            <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>
                🔒 Connected as student: <strong>{currentUser.fullName}</strong>
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Customize Guest Account:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 w-28 sm:w-32 focus:outline-none focus:border-amber-500"
                  placeholder="Name"
                />
            </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-red-800 dark:text-amber-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>
            PM Shri School digital library infrastructure active (Mumbai Region)
          </span>
        </div>
      </section>

      {/* Main Body */}
      <main
        id="main-content-area"
        className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8"
      >
        {/* VIEW CONDITIONAL RENDERING */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key="dash"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <WelcomeTab
                onNavigateToAIStories={() => setActiveTab("story")}
                onNavigateToBooks={() => setActiveTab("books")}
                currentUser={currentUser}
              />

              {/* Grid Layout containing Bento-style library highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Highlight 1: AI Prompt Quickstart */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 flex flex-col justify-between shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>
                  <div className="space-y-3 relative z-10">
                    <span className="bg-amber-500 text-slate-900 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Interactive Fables
                    </span>
                    <h3 className="text-xl font-bold font-sans text-amber-100">
                      AI Story Adventure
                    </h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Wander deep into classical folklore, Indian heritage, and
                      local Powai science riddles with adaptive story narration.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("story")}
                    className="mt-6 w-full py-2.5 bg-white/10 hover:bg-amber-500 hover:text-slate-900 text-white text-xs font-semibold rounded-xl border border-white/10 transition-all inline-flex items-center justify-center gap-2 group"
                  >
                    Enter Story Realm{" "}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Highlight 2: Social Media Quick Glance */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between group">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="bg-red-50 text-red-800 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Power of Reading
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Simulated Feed
                      </span>
                    </div>
                    <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] font-semibold flex items-center justify-center">
                          AK
                        </div>
                        <span className="text-[11px] font-bold text-slate-700">
                          Ashish Kumar (Librarian)
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs italic leading-relaxed">
                        "Delighted with the responses for the book-review
                        contest. Students of KV IIT Powai keep elevating our
                        parameters of discussion!"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("social")}
                    className="mt-4 text-xs font-bold text-red-800 hover:text-red-900 inline-flex items-center gap-1.5 self-start group transition-colors"
                  >
                    Go to Library Buzz Feed{" "}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Highlight 3: Quick Literary Tip */}
                <div className="bg-gradient-to-br from-indigo-800 to-purple-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-3">
                    <span className="bg-white/10 text-violet-200 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Librarian Tip
                    </span>
                    <h3 className="text-lg font-bold text-violet-100">
                      How to use "Mentor Tidbits"?
                    </h3>
                    <p className="text-violet-200/90 text-xs leading-relaxed">
                      Type key words in our Creative Hub to generate poems. The
                      integrated AI highlights literary devices like
                      *Alliteration*, *Hyperbole* or *Personification* to
                      sharpen your school essay skills!
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("creative")}
                    className="mt-6 w-full py-2.5 bg-violet-500/30 hover:bg-violet-500/50 text-white text-xs font-semibold rounded-xl border border-violet-500/20 transition-all inline-flex items-center justify-center gap-1.5"
                  >
                    Open Creative Studio
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* AI STORYTELLING REALM */}
          {activeTab === "story" && (
            <motion.div
              key="story-tab"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Sidebar Settings Panel for Story */}
              <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" /> Story
                    Parameters
                  </h2>
                  <p className="text-xs text-slate-400">
                    Configure your personalized fables
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Genre selection under KV Traditions */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Traditional Genre / Theme
                    </label>
                    <select
                      value={storyGenre}
                      onChange={(e) => setStoryGenre(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-sans text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>Panchatantra Wisdom</option>
                      <option>Sanjay Gandhi National Park Safari</option>
                      <option>The Lost Tech Artifact of IIT Powai</option>
                      <option>Tenali Rama Wit Trials</option>
                      <option>Riddles of the Powai Lake Crocodile</option>
                      <option>Cosmic Space Expedition (ISRO tribute)</option>
                    </select>
                  </div>

                  {/* Character Preset select */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Protagonist Persona
                    </label>
                    <select
                      value={protagonist}
                      onChange={(e) => setProtagonist(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-indigo-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option>Aarav the Curiosity Scholar</option>
                      <option>Suhani the Aspiring Biotech Tinkerer</option>
                      <option>Arjun the Ancient Manuscript Conservator</option>
                      <option>A Wise Jungle Monkey of Powai Forest</option>
                    </select>

                    <div className="mt-2">
                      <span className="text-[10px] text-slate-400">
                        Or type custom name:
                      </span>
                      <input
                        type="text"
                        value={customProtagonist}
                        onChange={(e) => setCustomProtagonist(e.target.value)}
                        placeholder="e.g. Aditi from Class VII"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-indigo-950 mt-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Reading difficulty adjust */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Reading Age / Tone
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      {["Juniors (Age 7-10)", "Middle School (Age 11-14)"].map(
                        (lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setReadingLevel(lvl)}
                            className={`p-2 rounded-lg border text-[11px] ${
                              readingLevel === lvl
                                ? "bg-amber-100 border-amber-300 font-bold text-amber-900"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            {lvl}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Optional Custom Topic input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Optional Plot Twists (AI Grounding)
                    </label>
                    <textarea
                      value={storyPromptText}
                      onChange={(e) => setStoryPromptText(e.target.value)}
                      className="w-full h-16 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 text-indigo-950"
                      placeholder="e.g. Include a friendly tech-advanced robot, or a hidden Sanskrit scroll inside the IIT computer lab."
                    />
                  </div>
                </div>

                <button
                  onClick={handleStartAdventure}
                  disabled={isStoryLoading}
                  className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow"
                >
                  {isStoryLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Gathering
                      scroll chapters...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Begin Story Quest
                    </>
                  )}
                </button>

                {/* Voice Narration configuration */}
                {speechSynthesisActive && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-emerald-600" /> AI Reader
                      Voice Narration
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Configure your preferred text-to-speech speaker device:
                    </p>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => setSelectedVoiceName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-1.5 text-xs text-indigo-950"
                    >
                      {availableVoices.map((voice, idx) => (
                        <option key={idx} value={voice.name}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Story Display Board */}
              <div className="lg:col-span-8 space-y-6">
                {/* Adventure container */}
                <div className="bg-slate-900 text-indigo-50 rounded-3xl p-6 md:p-8 min-h-[420px] flex flex-col justify-between border border-slate-800 shadow-xl relative overflow-hidden">
                  {/* Subtle Background decoration */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-red-800/10 rounded-full blur-[80px] pointer-events-none"></div>

                  {isStoryLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 rounded-full border-t-2 border-amber-400 border-r-2 border-r-amber-300 animate-spin"></div>
                      <p className="text-amber-300 text-xs font-mono">
                        The AI Storyteller is sketching your adventure...
                      </p>
                    </div>
                  ) : currentChapter ? (
                    <div className="space-y-6 relative z-10 index">
                      {/* Chapter Heading with voice controls */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-indigo-950 pb-4 gap-4">
                        <div>
                          <span className="text-[11px] font-mono uppercase text-amber-400 uppercase tracking-widest">
                            {storyGenre} Adventure
                          </span>
                          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
                            {currentChapter.title}
                          </h2>
                        </div>

                        {/* Audio controls */}
                        <div className="flex items-center gap-2">
                          {isNarrating ? (
                            <button
                              onClick={stopNarration}
                              className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600 text-red-100 hover:text-white rounded-lg text-xs font-medium border border-red-500/30 transition-all flex items-center gap-1.5"
                            >
                              <VolumeX className="w-3.5 h-3.5" /> Stop Reader
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                narrateStory(currentChapter.storySegment)
                              }
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Listen to AI
                              Librarian
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Main Paragraph content and prompt */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Story segment block */}
                        <div className="md:col-span-8 space-y-4 leading-relaxed font-sans text-sm md:text-base text-slate-200">
                          {currentChapter.storySegment
                            .split("\n\n")
                            .map((para, i) => (
                              <p key={i}>
                                {para.startsWith("**") ? (
                                  <span className="leading-relaxed whitespace-pre-line">
                                    {para.replace(/\*\*/g, "")}
                                  </span>
                                ) : (
                                  para
                                )}
                              </p>
                            ))}
                        </div>

                        {/* Creative vector prompt or illustration block */}
                        <div className="md:col-span-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs text-indigo-200 space-y-3">
                          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                            🎨 BOOK ILLUSTRATION PROMPT
                          </span>
                          <div className="w-full aspect-[4/3] rounded-lg bg-indigo-950 flex flex-col items-center justify-center p-3 text-center border border-indigo-900 shadow-inner relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-red-900/30"></div>
                            <span className="text-2xl mb-1.5 block relative z-10">
                              📖
                            </span>
                            <p className="text-[11px] text-slate-300 italic relative z-10 leading-tight">
                              "{currentChapter.illustrationPrompt}"
                            </p>
                          </div>
                          <p className="text-[10px] text-indigo-300/80 leading-normal">
                            This visual prompt is ready for book artists!
                          </p>
                        </div>
                      </div>

                      {/* Choices block */}
                      <div className="border-t border-indigo-950 pt-5 mt-4">
                        {currentChapter.isEnd ? (
                          <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                              <span className="font-bold text-amber-300 text-sm block mb-1">
                                🎓 Knowledge Quest Achieved!
                              </span>
                              Your exploration has concluded beautifully. You
                              have completed the story pathway! Remember the
                              morals learned from this KV reading experience.
                            </div>

                            <div className="flex gap-4">
                              <button
                                onClick={handleStartAdventure}
                                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl text-xs flex items-center gap-1.5"
                              >
                                Play Another Adventure
                              </button>
                              <button
                                onClick={handleSaveCurrentStory}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs border border-slate-700 flex items-center gap-1.5"
                              >
                                <Bookmark className="w-4 h-4 text-amber-400" />{" "}
                                Save this Adventure
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <span className="text-xs uppercase font-semibold text-slate-400 block tracking-widest uppercase">
                              🛡️ Choose your Path of Enquiry:
                            </span>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {currentChapter.choices &&
                              currentChapter.choices.length > 0 ? (
                                currentChapter.choices.map((choice, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => handleChoosePath(choice)}
                                    className="p-4 rounded-xl bg-slate-800 hover:bg-indigo-900 text-left text-xs font-semibold border border-indigo-950 hover:border-amber-500/40 text-slate-100 hover:text-white transition-all transform hover:-translate-y-0.5"
                                  >
                                    <div className="flex gap-2.5 items-start">
                                      <span className="w-5 h-5 rounded-full bg-indigo-950 text-amber-300 flex items-center justify-center flex-shrink-0 text-[10px]">
                                        {idx + 1}
                                      </span>
                                      <span className="leading-relaxed">
                                        {choice}
                                      </span>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <p className="text-xs text-red-400">
                                  No options found. Restart your adventure
                                  configuration!
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                        <Sparkles className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h3 className="text-lg font-bold text-white">
                          Assemble Your Story Matrix
                        </h3>
                        <p className="text-slate-400 text-xs">
                          Configure your theme on the left panel and click
                          'Begin Story Quest' to let the AI voice librarian
                          craft a tailor-made adventure.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Library Interactive Logs / Saved stories */}
                {savedStories.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Your Storytelling LedgerBook
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedStories.map((story) => (
                        <div
                          key={story.id}
                          className="p-4 rounded-2xl border border-slate-100 space-y-2 text-xs relative"
                        >
                          <div className="flex justify-between items-center">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold uppercase text-[9px]">
                              {story.genre}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {story.date}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 line-clamp-1">
                            {story.title}
                          </h4>
                          <p className="text-slate-500 line-clamp-2">
                            Protagonist: **{story.character}** was selected.
                            This story is stored internally within this
                            laboratory node.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* AI BOOK RECOMMENDATION AND CB SECTOR DESK */}
          {activeTab === "books" && (
            <motion.div
              key="books-tab"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              {/* Optional Reservation Alert feedback banner */}
              <AnimatePresence>
                {bookReservationSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs md:text-sm rounded-2xl flex items-start gap-3 shadow-sm animate-fade-in"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Library Ledger Notification</p>
                      <p className="leading-relaxed text-emerald-800">
                        {bookReservationSuccess}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filtering Bento Bar */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-red-800" /> Recent
                      Arrivals & Library Catalog
                    </h2>
                    <p className="text-xs text-slate-400">
                      Newly cataloged books, student textbooks, and reference
                      items at PM Shri KV IIT Powai Library.
                    </p>
                  </div>

                  {/* Stats Badge */}
                  <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-150 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>
                      {
                        recentBooksList.filter((b) => b.status === "Available")
                          .length
                      }{" "}
                      copies ready for check-out
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {/* Search input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Search Books
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={booksSearchQuery}
                        onChange={(e) => setBooksSearchQuery(e.target.value)}
                        placeholder="Search title, author, or genre..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-indigo-950 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-8"
                      />
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                    </div>
                  </div>

                  {/* Genre filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Filter by Genre
                    </label>
                    <select
                      value={selectedGenreFilter}
                      onChange={(e) => setSelectedGenreFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-indigo-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="All">All Genres</option>
                      <option value="Inspirational">
                        Inspirational / STEM
                      </option>
                      <option value="Classic">
                        Classic Literature / Fiction
                      </option>
                      <option value="Biography">Biography</option>
                      <option value="Cosmology">Cosmology & Physics</option>
                      <option value="Morals">Culture & Morals</option>
                    </select>
                  </div>

                  {/* Grade Standard filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Grade Stream
                    </label>
                    <select
                      value={selectedGradeFilter}
                      onChange={(e) => setSelectedGradeFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-indigo-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="All">All Grades</option>
                      <option value="Primary">Primary (Class 1-5)</option>
                      <option value="Middle">Middle (Class 6-8)</option>
                      <option value="High">High (Class 9-10)</option>
                      <option value="Secondary">
                        Senior Secondary (Class 11-12)
                      </option>
                    </select>
                  </div>

                  {/* Status filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Shelving Status
                    </label>
                    <select
                      value={selectedStatusFilter}
                      onChange={(e) => setSelectedStatusFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-indigo-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Available">Available Only</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Reference Only">
                        Reference Desk Only
                      </option>
                    </select>
                  </div>
                </div>

                {/* Filter quick resets indicator */}
                {(booksSearchQuery !== "" ||
                  selectedGenreFilter !== "All" ||
                  selectedGradeFilter !== "All" ||
                  selectedStatusFilter !== "All") && (
                  <div className="flex items-center justify-between text-xs bg-amber-500/5 px-4 py-2.5 rounded-xl border border-amber-500/15">
                    <span className="text-amber-800 font-semibold">
                      Filtering is currently active (
                      {filteredRecentBooks.length} matched outcomes)
                    </span>
                    <button
                      onClick={() => {
                        setBooksSearchQuery("");
                        setSelectedGenreFilter("All");
                        setSelectedGradeFilter("All");
                        setSelectedStatusFilter("All");
                      }}
                      className="text-red-800 font-sans font-bold hover:underline"
                    >
                      Reset Filter Criteria
                    </button>
                  </div>
                )}
              </div>

              {/* Main books grid */}
              {filteredRecentBooks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecentBooks.map((book) => {
                    const isFav = !!savedFavoritesMap[book.id];
                    return (
                      <div
                        key={book.id}
                        className="bg-white rounded-3xl border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                      >
                        {/* Upper Color Band Indicator representing book cover strip */}
                        <div
                          className={`h-3 w-full ${
                            book.genre.includes("STEM")
                              ? "bg-purple-600"
                              : book.genre.includes("Classic")
                                ? "bg-emerald-600"
                                : book.genre.includes("Biography")
                                  ? "bg-cyan-600"
                                  : book.genre.includes("Cosmology")
                                    ? "bg-slate-800"
                                    : "bg-amber-500"
                          }`}
                        />

                        <div className="p-6 space-y-4 flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[9px] font-bold uppercase tracking-wider">
                              {book.genre}
                            </span>

                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                book.status === "Available"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : book.status === "Reserved"
                                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                                    : "bg-slate-50 text-slate-800 border border-slate-200"
                              }`}
                            >
                              {book.status}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-sans font-bold text-slate-800 text-base leading-snug group-hover:text-red-800 transition-colors">
                              {book.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-serif mt-1">
                              Written by{" "}
                              <strong className="text-slate-700">
                                {book.author}
                              </strong>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-mono">
                            <span>
                              📚 Pages:{" "}
                              <strong className="text-slate-600">
                                {book.pages}
                              </strong>
                            </span>
                            <span>
                              📍 Location:{" "}
                              <strong className="text-slate-600">
                                {book.rackLocation}
                              </strong>
                            </span>
                            <span>
                              🎯 Grade:{" "}
                              <strong className="text-slate-600">
                                {book.gradeLevel}
                              </strong>
                            </span>
                          </div>

                          <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                            {book.description}
                          </p>

                          {/* Why Recommended box */}
                          <div className="p-3 bg-red-50/40 border border-red-100/50 rounded-2xl text-[11px] text-red-950">
                            <span className="font-bold text-red-800 block mb-1">
                              🎓 NEP RECOMMENDATION CRITERIA:
                            </span>
                            {book.whyRecommended}
                          </div>

                          {/* Creative Challenge box */}
                          <div className="p-3 bg-amber-50/30 border border-amber-100/50 rounded-2xl text-[11px] text-amber-950 space-y-1">
                            <span className="font-bold text-amber-800 flex items-center gap-1">
                              <Award className="w-3.5 h-3.5 text-amber-500" />{" "}
                              KV HANDS-ON CHALLENGE:
                            </span>
                            <p className="italic leading-relaxed text-slate-600">
                              {book.funActivity}
                            </p>
                          </div>
                        </div>

                        {/* Interactive Footer buttons */}
                        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4">
                          {book.status === "Available" ? (
                            <button
                              onClick={() => handleReserveBook(book.id)}
                              className="px-4 py-2 bg-red-800 text-white hover:bg-slate-900 rounded-xl text-xs font-semibold transition-all shadow hover:shadow-red-800/10 flex items-center gap-1.5"
                            >
                              <BookOpenCheck className="w-4 h-4" /> Reserve To
                              Borrow
                            </button>
                          ) : (
                            <button
                              disabled
                              className="px-4 py-2 bg-slate-200 text-slate-400 rounded-xl text-xs font-semibold cursor-not-allowed flex items-center gap-1.5"
                            >
                              {book.status === "Reserved"
                                ? "Copy Reserved"
                                : "Reference Only"}
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleFavoriteBook(book.id)}
                            className={`p-2 rounded-xl transition-all border ${
                              isFav
                                ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                            }`}
                            title={isFav ? "Remove Favorite" : "Add Favorite"}
                          >
                            <Heart
                              className={`w-4 h-4 ${isFav ? "fill-current" : ""}`}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mx-auto">
                    📚
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold">
                      No Match in Recent Books Shelf
                    </h3>
                    <p className="text-slate-500 text-xs">
                      We couldn't locate any recent books matching your custom
                      filter configuration. Try adjusting your grade level,
                      shelving status, or typing terms in the search bar.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setBooksSearchQuery("");
                      setSelectedGenreFilter("All");
                      setSelectedGradeFilter("All");
                      setSelectedStatusFilter("All");
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Clear Filter Criteria
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* CREATIVE HUB - WRITING LAB */}
          {activeTab === "creative" && (
            <motion.div
              key="creative-tab"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Sidebar Input form */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-purple-600" /> KV Student
                    Creative Desk
                  </h2>
                  <p className="text-xs text-slate-400">
                    Collaborate with the AI literary critic to compose poems,
                    lyrics, or novels.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Lit topic */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Literary Subject / Topic
                    </label>
                    <input
                      type="text"
                      value={creativeTopic}
                      onChange={(e) => setCreativeTopic(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                      placeholder="e.g. Majestic peacocks inside Sanjay Gandhi National Park"
                    />
                  </div>

                  {/* Form Style selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Literary Format
                    </label>
                    <select
                      value={creativeForm}
                      onChange={(e) => setCreativeForm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    >
                      <option>Poem (Rhyming verses)</option>
                      <option>Haiku (5-7-5 syllables traditional)</option>
                      <option>First Lines of a Mystery Novel</option>
                      <option>Socratic Dialogue dialogue</option>
                    </select>
                  </div>

                  {/* Literary Mood */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Mood & Expression
                    </label>
                    <select
                      value={creativeMood}
                      onChange={(e) => setCreativeMood(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                    >
                      <option>Inspiring & Scientific</option>
                      <option>Traditional Sanskrit-English fusion</option>
                      <option>Witty & Humorous</option>
                      <option>Mysterious & Suspenseful</option>
                      <option>Melodious & Loving</option>
                    </select>
                  </div>

                  {/* Keywords tag cloud */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                      Keywords to blend in (comma filtered)
                    </label>
                    <input
                      type="text"
                      value={creativeKeywords}
                      onChange={(e) => setCreativeKeywords(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800"
                      placeholder="e.g. monsoon, peacock, chalk, computers"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Separate terms by commas so the AI extracts them safely.
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="includeAIImage"
                      checked={includeAIImage}
                      onChange={(e) => setIncludeAIImage(e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-500"
                    />
                    <label
                      htmlFor="includeAIImage"
                      className="text-xs font-semibold text-slate-700"
                    >
                      Also generate a beautiful AI illustration
                    </label>
                  </div>
                </div>

                <button
                  onClick={generateCreativeContent}
                  disabled={isCreativeLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-800 to-indigo-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow"
                >
                  {isCreativeLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />{" "}
                      {includeAIImage
                        ? "Crafting words & painting image..."
                        : "Mentoring literary devices..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" /> Generate
                      Beautiful Masterpiece
                    </>
                  )}
                </button>
              </div>

              {/* Creative Output area with Mentor Tidbits */}
              <div className="lg:col-span-7 space-y-6">
                {isCreativeLoading ? (
                  <div className="bg-slate-900 text-white rounded-3xl p-12 text-center h-full min-h-[380px] flex flex-col items-center justify-center space-y-4 border border-indigo-950">
                    <div className="w-12 h-12 rounded-full border-t-2 border-purple-500 animate-spin"></div>
                    <p className="text-purple-300 text-xs font-mono">
                      {includeAIImage
                        ? "Blending syllables and rendering beautiful visuals..."
                        : "Blending syllables and rhyme structures..."}
                    </p>
                  </div>
                ) : creativeResult ? (
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
                    {/* Header banner */}
                    <div className="border-b border-purple-100 pb-4">
                      <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                        {creativeForm} • {creativeMood}
                      </span>
                      <h3 className="text-xl font-bold font-sans text-slate-800 mt-2">
                        {creativeResult.title}
                      </h3>
                    </div>

                    {/* AI Illustration (if generated) */}
                    {creativeImageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative aspect-video sm:aspect-square md:aspect-video w-full bg-slate-50">
                        <img
                          src={creativeImageUrl}
                          alt={creativeResult.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* The literary piece itself */}
                    <blockquote className="text-slate-800 leading-relaxed font-serif text-sm md:text-base border-l-4 border-purple-600 pl-4 py-1 italic whitespace-pre-line bg-purple-50/30 p-4 rounded-r-2xl">
                      {creativeResult.output}
                    </blockquote>

                    {/* Mentor insights explanations of literary devices */}
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" /> Mentor
                        insights & Literary Devices
                      </h4>
                      <p className="text-xs text-slate-400">
                        Ashish Kumar’s library guide explains how to replicate
                        these artistic techniques in standard CBSE tests:
                      </p>

                      <div className="space-y-2">
                        {creativeResult.educationalTips &&
                          creativeResult.educationalTips.map((tip, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2.5 items-start text-xs bg-slate-50 p-3 rounded-xl border border-slate-100"
                            >
                              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] flex-shrink-0 font-bold mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-slate-600 leading-relaxed font-sans">
                                {tip}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${creativeResult.title}\n\n${creativeResult.output}`,
                          );
                          alert(
                            "Poem copied onto clipboard! Show it to your class tutor.",
                          );
                        }}
                        className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        Copy Piece
                      </button>
                      <button
                        onClick={generateCreativeContent}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                      >
                        Try New Variations
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 text-white rounded-3xl p-8 text-center min-h-[380px] flex flex-col justify-center items-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                      💡
                    </div>
                    <div className="space-y-1.5 max-w-sm">
                      <h3 className="text-lg font-bold">
                        Write like a Nobel Laureate
                      </h3>
                      <p className="text-slate-400 text-xs">
                        Configure a topic or write about Sanjay Gandhi National
                        Park, and watch the AI write and breakdown the classical
                        literary elements used!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SOCIAL LIFE - STUDENT BUZZ WALL */}
          {activeTab === "social" && (
            <motion.div
              key="social-tab"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Creator segment */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-red-800" /> Share
                      Your Reading Journey
                    </h3>
                    <p className="text-xs text-slate-400">
                      Post reviews or library stories on our simulated KV Powai
                      Library wall!
                    </p>
                  </div>

                  <form onSubmit={handleAddPost} className="space-y-4">
                    {/* Book Metadata details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Book Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={newPostBookTitle}
                          onChange={(e) => setNewPostBookTitle(e.target.value)}
                          placeholder="e.g. Wings of Fire"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Author Name
                        </label>
                        <input
                          type="text"
                          value={newPostAuthor}
                          onChange={(e) => setNewPostAuthor(e.target.value)}
                          placeholder="e.g. Abdul Kalam"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                        />
                      </div>
                    </div>

                    {/* Rating Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        My Star Rating
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewPostRating(star)}
                            className={`text-xl transition-transform hover:scale-110 ${
                              newPostRating >= star
                                ? "text-amber-500"
                                : "text-slate-200"
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags or tags field */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Hashtags (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={newPostTags}
                        onChange={(e) => setNewPostTags(e.target.value)}
                        placeholder="e.g. STEM, India, MustRead"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-800"
                      />
                    </div>

                    {/* Post Content */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Write your review / reflection *
                      </label>
                      <textarea
                        required
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        rows={4}
                        placeholder="What is your central takeaway? Share your review so your school friends can like & comment!"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold transition-all shadow"
                    >
                      Broadcast to School Library Wall
                    </button>
                  </form>
                </div>

                {/* --- OFFICIAL SOCIAL MEDIA PAGES SECTION --- */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-red-800 bg-red-50 px-2.5 py-1 rounded-full font-bold">
                      🔴 Live School Feeds
                    </span>
                    <h3 className="text-base font-bold text-slate-800 mt-2.5 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-red-800 animate-pulse" />{" "}
                      Official Social Media Hub
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Get physical meet updates, book delivery schedules, and
                      notifications from Kendriya Vidyalaya.
                    </p>
                  </div>

                  {/* Tiny alert for follows */}
                  <AnimatePresence>
                    {socialAlertMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-2 overflow-hidden"
                      >
                        <Bell className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          {socialAlertMessage}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-4">
                    {/* Handle 1: Instagram */}
                    <div className="p-4 bg-gradient-to-r from-pink-50/50 to-orange-50/20 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 group/item">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                          <Instagram className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              Instagram Handle
                            </span>
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                              title="Verified link"
                            ></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            @pmshri_kviitpowai_lib
                          </span>
                          <span className="text-[10px] text-indigo-900/60 font-medium">
                            1,420 Active Readers
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleFollow(
                            "Instagram",
                            "@pmshri_kviitpowai_lib",
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                          followedHandles["Instagram"]
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-slate-900 hover:bg-slate-800 border-transparent text-white"
                        }`}
                      >
                        {followedHandles["Instagram"] ? "Following" : "Follow"}
                      </button>
                    </div>

                    {/* Handle 2: YouTube Channel */}
                    <div className="p-4 bg-gradient-to-r from-red-50/50 to-rose-50/20 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <Youtube className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              YouTube Channel
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>
                          <a
                            href="https://www.youtube.com/@LibraryPoint1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-red-600 font-bold hover:underline flex items-center gap-1 transition-colors mt-0.5"
                            title="Visit Library Point YouTube Channel"
                          >
                            Library Point{" "}
                            <ExternalLink className="w-2.5 h-2.5 inline text-red-500" />
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleFollow("YouTube", "Library Point")
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                          followedHandles["YouTube"]
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-slate-900 hover:bg-slate-800 border-transparent text-white"
                        }`}
                      >
                        {followedHandles["YouTube"]
                          ? "Subscribed"
                          : "Subscribe"}
                      </button>
                    </div>

                    {/* Handle 3: Twitter / X */}
                    <div className="p-4 bg-gradient-to-r from-sky-50/50 to-blue-50/20 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          <Twitter className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              X Desk Feed
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            @KVIITPowaiLib
                          </span>
                          <span className="text-[10px] text-indigo-900/60 font-medium">
                            412 Followers
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleFollow("X", "@KVIITPowaiLib")
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                          followedHandles["X"]
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-slate-900 hover:bg-slate-800 border-transparent text-white"
                        }`}
                      >
                        {followedHandles["X"] ? "Following" : "Follow"}
                      </button>
                    </div>

                    {/* Handle 4: Facebook Community */}
                    <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-slate-100 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Facebook className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              Facebook Club
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            KV IIT Powai Readers Group
                          </span>
                          <span className="text-[10px] text-indigo-900/60 font-medium">
                            2,300 Members
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleToggleFollow("Facebook", "KV IIT Powai Readers")
                        }
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border ${
                          followedHandles["Facebook"]
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-slate-900 hover:bg-slate-800 border-transparent text-white"
                        }`}
                      >
                        {followedHandles["Facebook"] ? "Joined" : "Join"}
                      </button>
                    </div>

                    {/* Handle 5: Padlet Book Review Submission */}
                    <div className="p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/20 border border-amber-200/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                          <BookOpenCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              Padlet Handle for Book Review submission
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Submission Desk"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            KV IIT Powai Virtual Library
                          </span>
                        </div>
                      </div>
                      <a
                        href="https://padlet.com/kumarashish12345/kviit-powai-virtual-library-online-book-review-20wn0qe3d8db69bv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all bg-red-800 hover:bg-red-900 text-white flex items-center gap-1 shadow flex-shrink-0"
                      >
                        Submit Review <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Handle 6: Podcast of KV IIT LIBRARY */}
                    <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 border border-emerald-200/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              Podcast of KV IIT LIBRARY
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Podcast Desk"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            Spotify Creators Profile
                          </span>
                        </div>
                      </div>
                      <a
                        href="https://creators.spotify.com/pod/profile/ashish-kumar496/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 shadow flex-shrink-0"
                      >
                        Listen Now <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Handle 7: LinkTr.ee */}
                    <div className="p-4 bg-gradient-to-r from-lime-50/50 to-green-50/20 border border-lime-200/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-800 flex items-center justify-center flex-shrink-0">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              LinkTr.ee
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Link Hub"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            KV IIT Powai Universal Links
                          </span>
                        </div>
                      </div>
                      <a
                        href="https://linktr.ee/librarykviitpowai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all bg-lime-700 hover:bg-lime-800 text-white flex items-center gap-1 shadow flex-shrink-0"
                      >
                        Explore Links <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Handle 8: Sound Library */}
                    <div className="p-4 bg-gradient-to-r from-orange-50/50 to-amber-50/20 border border-orange-200/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                          <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              Sound Library
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Sound Hub"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            SoundCloud Audio Collection
                          </span>
                        </div>
                      </div>
                      <a
                        href="https://soundcloud.com/ashish-kumar-979097077?utm_campaign=social_sharing&utm_medium=text&utm_source=clipboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1 shadow flex-shrink-0"
                      >
                        Listen Now <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Handle 9: Wakelet */}
                    <div className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-blue-200/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              Wakelet
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Wakelet Profile"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            Curated Resources
                          </span>
                        </div>
                      </div>
                      <a
                        href="https://wakelet.com/@kviitpowaivirtuallibrary"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow flex-shrink-0"
                      >
                        Explore <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Handle 10: Linkedin */}
                    <div className="p-4 bg-gradient-to-r from-sky-50/50 to-blue-50/20 border border-sky-200/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                          <Linkedin className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              Linkedin
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Linkedin Profile"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            Professional Network
                          </span>
                        </div>
                      </div>
                      <a
                        href="https://www.linkedin.com/in/ashish-kumar-87678455/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all bg-sky-700 hover:bg-sky-800 text-white flex items-center gap-1 shadow flex-shrink-0"
                      >
                        Connect <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Handle 11: WEB OPAC */}
                    <div className="p-4 bg-gradient-to-r from-purple-50/50 to-fuchsia-50/20 border border-purple-200/60 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                          <Search className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              WEB OPAC
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active Catalog Search"></span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            Online Public Access Catalog
                          </span>
                        </div>
                      </div>
                      <a
                        href="https://eg4.nic.in/OPAC/Default.aspx?CL_NAME=KVS3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 shadow flex-shrink-0"
                      >
                        Search Catalog <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simulated Feed Posts */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                    Library Buzz Feed
                  </h3>
                  <span className="text-xs text-slate-400 font-mono italic">
                    Real-Time Community Updates
                  </span>
                </div>

                <div className="space-y-4">
                  {socialPosts.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-4 shadow-sm">
                      <div className="w-16 h-16 bg-red-50 text-red-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                        ✍️
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800">
                          No Posts on the Wall Yet
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Be the first to share your reading journey on the
                          official school library wall! Post a book review or
                          library story using the form on the left.
                        </p>
                      </div>
                    </div>
                  ) : (
                    socialPosts.map((post) => {
                      const hasLiked = !!postLikesMap[post.id];
                      const commInput = commentInputMap[post.id] || "";
                      const commsList = postCommentsMap[post.id] || [];

                      return (
                        <div
                          key={post.id}
                          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4"
                        >
                          {/* Header details */}
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-100/50 text-red-800 font-bold flex items-center justify-center uppercase">
                                {post.studentName.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-xs text-slate-800">
                                    {post.studentName}
                                  </h4>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {post.timestamp}
                                </p>
                              </div>
                            </div>

                            {/* Rating display */}
                            <div className="flex text-amber-500 font-bold text-xs select-none">
                              {"★".repeat(post.rating)}
                              {"☆".repeat(5 - post.rating)}
                            </div>
                          </div>

                          {/* Story content */}
                          <div className="space-y-2">
                            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-[#1e3a8a] block mb-1">
                                📖 BOOK REVIEW
                              </span>
                              <span
                                id="book-title-social"
                                className="font-sans font-bold text-slate-800 text-sm"
                              >
                                {post.bookTitle}
                              </span>
                              {post.author && (
                                <span className="text-xs text-slate-400 ml-1 italic">
                                  by {post.author}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                              {post.content}
                            </p>
                          </div>

                          {/* Hashtag clouds */}
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {post.tags &&
                              post.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] font-medium text-red-800 bg-red-50 px-2 py-0.5 rounded-full border border-red-100/50"
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>

                          {/* Like/Comment Buttons footer bar */}
                          <div className="flex items-center gap-4 pt-3 border-t border-slate-50 text-slate-400 text-xs">
                            {/* Like */}
                            <button
                              onClick={() => handleLikePost(post.id)}
                              className={`flex items-center gap-1.5 hover:text-rose-600 group transition-colors ${
                                hasLiked ? "text-rose-600 font-bold" : ""
                              }`}
                            >
                              <Heart
                                className={`w-4 h-4 ${hasLiked ? "fill-rose-600 text-rose-600" : "group-hover:scale-110"}`}
                              />
                              <span>{post.likes} Likes</span>
                            </button>

                            {/* Comments counter */}
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              <span>{post.commentsCount} Comments</span>
                            </div>
                          </div>

                          {/* Comments Block rendering */}
                          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                            {/* Comments List history */}
                            {commsList.length > 0 && (
                              <div className="space-y-2">
                                {commsList.map((commText, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs p-2 bg-white rounded-lg border border-slate-100 leading-relaxed text-slate-600"
                                  >
                                    {commText}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Create new comment */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={commInput}
                                onChange={(e) =>
                                  setCommentInputMap((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                placeholder="Write a supportive reply..."
                                className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="px-3 bg-slate-900 text-amber-400 rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center justify-center"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <MenuTab />
            </motion.div>
          )}

          {activeTab === "magazine" && (
            <motion.div
              key="magazine"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <MagazineTab />
            </motion.div>
          )}

          {activeTab === "staff" && (
            <motion.div
              key="staff"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <StaffTab />
            </motion.div>
          )}

          {activeTab === "readers-club" && (
            <motion.div
              key="readers-club"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <ReadersClubTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Flagship footer */}
      <footer className="bg-slate-900 border-t border-indigo-950 px-4 md:px-8 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left space-y-1">
            <h4 className="text-white font-bold leading-none">
              PM Shri Kendriya Vidyalaya IIT Powai Sector
            </h4>
            <p className="text-[10px] text-slate-500">
              Autonomous body under Ministry of Education, Government of India
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-[10px] text-slate-400 font-semibold justify-center">
            <a
              href="#welcome"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("dashboard");
              }}
              className="hover:text-amber-400"
            >
              Library Samhita
            </a>
            <span>•</span>
            <a
              href="https://www.tigera.io/learn/guides/llm-security/ai-safety/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400"
            >
              AI Safety Guidelines
            </a>
            <span>•</span>
            <a
              href="#help"
              onClick={(e) => {
                e.preventDefault();
                alert(
                  "Contact Librarian via official mail: ashishkumar.librarian@gmail.com",
                );
              }}
              className="hover:text-amber-400"
            >
              Ask Librarian Support
            </a>
          </div>
        </div>
      </footer>

      {/* Auth Modal Portal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
