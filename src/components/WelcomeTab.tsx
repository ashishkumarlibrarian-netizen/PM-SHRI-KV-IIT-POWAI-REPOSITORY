import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, HelpCircle, Award, Compass, ShieldAlert, Sparkles, User, FileText, CheckCircle2, Edit3, Plus, Trash2, Send, Loader2, X, Image as ImageIcon } from "lucide-react";
import { NoticeItem, LibraryStat,  } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface WelcomeTabProps {
  onNavigateToAIStories: () => void;
  onNavigateToBooks: () => void;
  currentUser:  | null;
}

export default function WelcomeTab({ onNavigateToAIStories, onNavigateToBooks, currentUser }: WelcomeTabProps) {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noticeToDelete, setNoticeToDelete] = useState<NoticeItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Activity");
  const [content, setContent] = useState("");
  const [badge, setBadge] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [imageUrl, setImageUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isHeroFormOpen, setIsHeroFormOpen] = useState(false);
  const [editingHeroImages, setEditingHeroImages] = useState<string[]>([]);

  const isAdmin = currentUser?.role === "admin";

  const checkIsOpen = () => {
    const now = new Date();
    const day = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (day >= 1 && day <= 6) {
      const currentTime = hours + minutes / 60;
      if (currentTime >= 7 && currentTime < 14) {
        return true;
      }
    }
    return false;
  };

  const [isOpenToday, setIsOpenToday] = useState(checkIsOpen());

  const fetchNotices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/notices?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setNotices(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHeroImages = async () => {
    try {
      const res = await fetch("/api/settings/hero-images?_t=" + Date.now());
      if (res.ok) {
        const data = await res.json();
        setHeroImages(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotices();
    fetchHeroImages();
    
    const timeInterval = setInterval(() => {
      setIsOpenToday(checkIsOpen());
    }, 60000); // Check every minute
    
    return () => clearInterval(timeInterval);
  }, []);
  
  useEffect(() => {
    if (heroImages.length <= 1) return;
    
    const sliderInterval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 10000); // 10 seconds
    
    return () => clearInterval(sliderInterval);
  }, [heroImages]);

  const openForm = (notice?: NoticeItem) => {
    if (notice) {
      setEditingId(notice.id);
      setTitle(notice.title);
      setDate(notice.date || "");
      setCategory(notice.category || "Activity");
      setContent(notice.content);
      setBadge(notice.badge || "");
      setPriority(notice.priority || "Normal");
      setImageUrl(notice.imageUrl || "");
      setMediaUrls(notice.mediaUrls || (notice.imageUrl ? [notice.imageUrl] : []));
    } else {
      setEditingId(null);
      setTitle("");
      setDate(new Date().toISOString().split('T')[0]);
      setCategory("Activity");
      setContent("");
      setBadge("");
      setPriority("Normal");
      setImageUrl("");
      setMediaUrls([]);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!noticeToDelete) return;
    const id = noticeToDelete.id;
    setNoticeToDelete(null);
    setSelectedNotice(null);
    
    try {
      const token = localStorage.getItem("kv_library_token");
      const res = await fetch(`/api/notices/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchNotices();
      } else {
        const txt = await res.text();
        console.error("Delete failed:", txt);
        if (res.status === 401) {
          alert("Your session has expired. Please log out and log back in.");
          localStorage.removeItem("kv_library_token");
          localStorage.removeItem("kv_library_user");
          window.location.reload();
        } else {
          alert("Failed to delete notice: " + txt);
        }
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while deleting the notice.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("kv_library_token");
      const url = editingId ? `/api/notices/${editingId}` : "/api/notices";
      const method = editingId ? "PUT" : "POST";
      
      const payload = { title, date, category, content, badge, priority, imageUrl: mediaUrls[0] || "", mediaUrls };
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        closeForm();
        fetchNotices();
      } else {
        const txt = await res.text();
        console.error("Submit failed:", txt);
        if (res.status === 401) {
          alert("Your session has expired. Please log out and log back in.");
          localStorage.removeItem("kv_library_token");
          localStorage.removeItem("kv_library_user");
          window.location.reload();
        } else {
          alert("Failed to save notice: " + txt);
        }
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving the notice.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    
    files.forEach(file => {
      if (file && (file as File).type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === "string") {
            setMediaUrls(prev => [...prev, event.target!.result as string]);
            if (mediaUrls.length === 0) setImageUrl(event.target!.result as string);
          }
        };
        reader.readAsDataURL(file as Blob);
      }
    });
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => {
      const newUrls = [...prev];
      newUrls.splice(index, 1);
      if (index === 0 && newUrls.length > 0) {
        setImageUrl(newUrls[0]);
      } else if (newUrls.length === 0) {
        setImageUrl("");
      }
      return newUrls;
    });
  };

  const stats: LibraryStat[] = [
    { label: "Total Books", value: "13,500+", iconName: "books", description: "Vast collection from young reader classics to encyclopedias" },
    { label: "Active Readers", value: "1,265+", iconName: "users", description: "Students, teachers, and staff engaging with our digital resources" },
    { label: "Digital Realms", value: "15+", iconName: "compass", description: "Interactive AI story realms and creative learning laboratories" },
  ];

  const rules = [
    "Books are for use.",
    "Every reader his/her book.",
    "Every book its reader.",
    "Save the time of the reader.",
    "Library is a growing organism.",
    "– The Five Laws of Library Science by Dr. S. R. Ranganathan"
  ];

  const renderIcon = (type: string) => {
    switch (type) {
      case "PM-Shri": return <Sparkles className="w-5 h-5 text-amber-500" />;
      case "Competition": return <Award className="w-5 h-5 text-purple-500" />;
      case "Activity": return <Compass className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-rose-500" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      id="welcome-tab-container" 
      className="space-y-8"
    >
      {/* Prime Minister Shri KV Flagship Banner */}
      <motion.div variants={itemVariants} id="pm-shri-header-banner" className="relative overflow-hidden bg-gradient-to-r from-red-900 to-amber-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-amber-500/20 group min-h-[400px] flex items-center">
        {/* Background Images */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 z-0">
            {heroImages.map((imgUrl, idx) => (
              <motion.img 
                key={idx}
                src={imgUrl}
                initial={{ opacity: 0 }}
                animate={{ opacity: idx === currentHeroIndex ? 0.35 : 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full object-cover"
                alt="Library Banner"
              />
            ))}
          </div>
        )}
        {heroImages.length === 0 && (
          <>
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16 z-0"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-2xl -ml-24 -mb-24 z-0"></div>
          </>
        )}
        
        {isAdmin && (
          <button 
            onClick={(e) => { e.stopPropagation(); setEditingHeroImages([...heroImages]); setIsHeroFormOpen(true); }}
            className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-lg text-xs font-medium flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Slider Images
          </button>
        )}
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 w-full">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> PM SHRI Exemplar Vidyalaya
            </div>
            <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-amber-100">
              Welcome to PM Shri KV IIT Powai Library
            </h1>
            <p className="text-red-100/90 leading-relaxed text-base max-w-xl backdrop-blur-sm">
              Nurturing scientific temper, critical enquiry, and literary wonder beside Powai Lake. Step into India’s flagship school digital library portal equipped with interactive AI learning experiences.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2 justify-center md:justify-start">
              {currentUser && (
                <button
                  onClick={onNavigateToAIStories}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Try AI Storyteller
                </button>
              )}
              <button
                onClick={onNavigateToBooks}
                className="px-6 py-3 bg-white/10 dark:bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 transition-all inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Explore Recent Books
              </button>
            </div>
          </div>
          
          <div className="hidden lg:block w-72 h-44 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative">
            {isOpenToday ? (
              <div className="absolute top-4 right-4 text-emerald-400 flex items-center gap-1.5 text-xs font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Open Today
              </div>
            ) : (
              <div className="absolute top-4 right-4 text-rose-400 flex items-center gap-1.5 text-xs font-semibold bg-rose-950/50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Closed Now
              </div>
            )}
            <div className="mt-2 space-y-4 text-xs font-mono">
              <div className="text-amber-300 uppercase tracking-widest text-center border-b border-white/10 pb-2">Vidyalaya Hours</div>
              <div className="flex flex-col text-white gap-1 items-center">
                <span className="text-slate-300">Monday - Saturday</span>
                <span className="font-semibold">07:00 AM - 02:00 PM</span>
              </div>
              <div className="flex flex-col text-slate-400 gap-1 items-center">
                <span className="text-slate-500">Sundays & Holidays</span>
                <span className="font-semibold">Closed</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Library Stats Board */}
      <motion.div variants={itemVariants} id="library-metrics-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div whileHover={{ y: -5 }} key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 text-slate-50 dark:text-slate-800/20 opacity-40 group-hover:scale-110 transition-transform">
              <BookOpen className="w-24 h-24 stroke-[0.5]" />
            </div>
            <div className="text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2 group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors">{stat.value}</div>
            <p className="text-slate-500 dark:text-slate-300 text-xs leading-relaxed relative z-10">{stat.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Split: Notice Board and Rules */}
      <div id="notice-rules-split-view" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Notice Board & PM Shri Announcements */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center text-red-800 dark:text-red-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">KV Powai Library Bulletin</h2>
                <p className="text-xs text-slate-400 dark:text-slate-400">NEP & Library Updates</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full hidden sm:inline-block">
                Mumbai Sector
              </span>
              {isAdmin && (
                <button
                  onClick={(e) => { e.stopPropagation(); openForm(); }}
                  className="px-4 py-2 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-900 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Notice
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : notices.length === 0 ? (
              <div className="text-center p-12 text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                No bulletin notices available.
              </div>
            ) : notices.map((notice, idx) => (
              <motion.div 
                key={notice.id} 
                onClick={() => setSelectedNotice(notice)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-all group"
              >
                <div className="flex items-start gap-3 md:w-3/4">
                  <div className="mt-1 w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
                    {renderIcon(notice.category)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-red-900 dark:group-hover:text-red-400 transition-colors">
                      {notice.title}
                    </h3>
                    {(() => {
                      const allMedia = notice.mediaUrls || (notice.imageUrl ? [notice.imageUrl] : []);
                      if (allMedia.length > 0) {
                        return (
                          <div className="mt-2 mb-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-w-sm hidden md:block">
                             <img src={allMedia[0]} alt={notice.title} className="w-full h-32 object-cover" />
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <p className="text-slate-500 dark:text-slate-300 text-sm line-clamp-1">{notice.content}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-400">
                      <span>{notice.date}</span>
                      <span>•</span>
                      <span className="text-red-700 dark:text-red-400 font-medium">{notice.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex md:flex-col justify-between items-end md:w-1/4 gap-2 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-2 md:pt-0">
                  {isAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); openForm(notice); }}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg absolute top-4 right-4 md:static"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {notice.priority === "High" ? (
                    <span className="text-[10px] uppercase font-mono font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 px-2 py-0.5 rounded">
                      High Priority
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      General
                    </span>
                  )}
                  {notice.badge && (
                    <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/50 px-2 py-0.5 rounded-full">
                      {notice.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Library Rules Panel */}
        <motion.div variants={itemVariants} className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-800 dark:text-amber-300 font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Library Samhita</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400">Guidelines & Etiquette</p>
            </div>
          </div>

          <div className="space-y-4">
            {rules.map((rule, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                className="flex gap-3 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-red-800 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{rule}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Librarian Profile and Welcome Message */}
      <motion.div variants={itemVariants} id="librarian-welcome-message-panel" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-red-800 text-white flex items-center justify-center text-3xl font-semibold shadow-inner flex-shrink-0 border-4 border-amber-500/10">
            AK
          </div>
          <div id="librarian-text" className="space-y-3 text-center md:text-left flex-1">
            <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Message from the Librarian</h3>
              <span className="bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/50 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Shri Ashish Kumar, Librarian
              </span>
            </div>
            <blockquote className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed">
              "Welcome, dear young scholars! A library is not merely a storehouse of books, but a lighthouse of knowledge. Our mission at PM Shri KV IIT Powai Library is to feed your inquisitiveness, spark creative expressions, and equip you with the mental tools of the 21st century. Through this portal, explore the worlds within these pages and unleash your scientific and literary potential using dynamic AI assistance designed responsibly under NEP guidelines."
            </blockquote>
            <p className="text-slate-400 dark:text-slate-400 text-xs">
              Email: ashishkumar.librarian@gmail.com | Kendriya Vidyalaya IIT Powai Sector, Mumbai
            </p>
          </div>
        </div>
      </motion.div>

      {/* Selected Notice Dialog Modal */}
      <AnimatePresence>
      {selectedNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-800 text-xs font-semibold">
                {renderIcon(selectedNotice.category)}
                {selectedNotice.category}
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors text-lg"
              >
                &times;
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{selectedNotice.title}</h3>
            <div className="text-xs text-slate-400 dark:text-slate-400 mb-4 font-mono">{selectedNotice.date}</div>
            
            {(() => {
              const allMedia = selectedNotice.mediaUrls || (selectedNotice.imageUrl ? [selectedNotice.imageUrl] : []);
              if (allMedia.length === 0) return null;
              return (
                <div className="mb-4 space-y-2">
                  <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                    <img src={allMedia[0]} alt={selectedNotice.title} className="w-full h-auto object-cover max-h-64" />
                  </div>
                  {allMedia.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {allMedia.slice(1).map((url, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden border border-slate-100 shadow-sm aspect-square">
                          <img src={url} alt={`${selectedNotice.title} ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
            
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm mb-6">{selectedNotice.content}</p>
            
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-700">
              {isAdmin ? (
                <button 
                  onClick={() => setNoticeToDelete(selectedNotice)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              ) : <div></div>}
              <button
                onClick={() => setSelectedNotice(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors"
              >
                Close BULLETIN
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Form Modal */}
      <AnimatePresence>
      {isFormOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="inline-block w-full max-w-2xl p-6 md:p-8 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-slate-900 rounded-3xl shadow-xl relative border border-slate-200 dark:border-slate-800"
            >
              <button 
                onClick={closeForm}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                {editingId ? "Edit Notice" : "New Notice"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-5 text-slate-800 dark:text-slate-200">
                <div>
                  <label className="block text-sm font-medium mb-1">Notice Title</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    placeholder="Enter notice title"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <input type="text" value={date} onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      placeholder="e.g. April 01, 2026"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    >
                      <option value="Activity">Activity</option>
                      <option value="PM-Shri">PM-Shri</option>
                      <option value="Competition">Competition</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Badge (Optional)</label>
                    <input type="text" value={badge} onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                      placeholder="e.g. Book Drive"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Content Details</label>
                  <textarea required value={content} onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all resize-none min-h-[120px]"
                    placeholder="Provide full description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notice Images (Optional)</label>
                  <label className="flex items-center justify-center w-full h-24 px-4 transition bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-amber-500 focus:outline-none">
                    <span className="flex items-center space-x-2 text-slate-500">
                      <ImageIcon className="w-5 h-5" />
                      <span className="font-medium text-sm">Drop images to attach, or browse</span>
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                  
                  {mediaUrls.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                      {mediaUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                          <img src={url} alt="upload preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeMedia(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500/90 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end gap-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={closeForm}
                    className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-900 rounded-xl font-semibold transition-colors shadow-lg shadow-slate-200 dark:shadow-none flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    <span>{editingId ? "Update Notice" : "Publish Notice"}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
      {noticeToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete Notice?</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
              Are you sure you want to delete "{noticeToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setNoticeToDelete(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button onClick={handleDelete}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-500/20 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Notice
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Hero Images Modal */}
      <AnimatePresence>
      {isHeroFormOpen && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Edit Hero Slider Images</h3>
              <button 
                onClick={() => setIsHeroFormOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-amber-500 focus:outline-none">
                <span className="flex flex-col items-center space-y-2 text-slate-500">
                  <ImageIcon className="w-8 h-8" />
                  <span className="font-medium">Drop images to add to the slider</span>
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;
                    files.forEach(file => {
                      if (file && (file as File).type.startsWith("image/")) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target && typeof event.target.result === "string") {
                            setEditingHeroImages(prev => [...prev, event.target!.result as string]);
                          }
                        };
                        reader.readAsDataURL(file as Blob);
                      }
                    });
                  }} 
                />
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[40vh] overflow-y-auto p-2">
                {editingHeroImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700">
                    <img src={img} alt={`Hero ${idx + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setEditingHeroImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setIsHeroFormOpen(false)}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const token = localStorage.getItem("kv_library_token");
                      const res = await fetch("/api/settings/hero-images", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ images: editingHeroImages })
                      });
                      if (res.ok) {
                        setHeroImages(editingHeroImages);
                        setIsHeroFormOpen(false);
                      }
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-semibold transition-colors shadow-lg flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Save Slider
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}
