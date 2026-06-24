import React, { useState } from "react";
import { BookOpen, Calendar, HelpCircle, Award, Compass, ShieldAlert, Sparkles, User, FileText, CheckCircle2 } from "lucide-react";
import { NoticeItem, LibraryStat, UserType } from "../types";
import { motion } from "motion/react";

interface WelcomeTabProps {
  onNavigateToAIStories: () => void;
  onNavigateToBooks: () => void;
  currentUser: UserType | null;
}

export default function WelcomeTab({ onNavigateToAIStories, onNavigateToBooks, currentUser }: WelcomeTabProps) {
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const stats: LibraryStat[] = [
    { label: "Total Books", value: "18,450+", iconName: "books", description: "Vast collection from young reader classics to advanced scientific encyclopedias" },
  ];

  const notices: NoticeItem[] = [
    {
      id: "1",
      title: "PUSTAKOUPHAR: Gift a Book, Share a Smile!",
      date: "April 01, 2026 - April 05, 2026",
      category: "Activity",
      content: "If you do not find a taker, deposit your books in the Library Green Book Bank. If you are looking for a gift (of books), get it from a student of your class or from the Library Green Book Bank. Old Books Can Shape Someone's Future.",
      badge: "Book Drive",
      priority: "High"
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

  return (
    <div id="welcome-tab-container" className="space-y-8">
      {/* Prime Minister Shri KV Flagship Banner */}
      <div id="pm-shri-header-banner" className="relative overflow-hidden bg-gradient-to-r from-red-900 to-amber-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-amber-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-2xl -ml-24 -mb-24"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> PM SHRI Exemplar Vidyalaya
            </div>
            <h1 className="text-3xl md:text-5xl font-sans font-bold tracking-tight text-amber-100">
              Welcome to PM Shri KV IIT Powai Library
            </h1>
            <p className="text-red-100/90 leading-relaxed text-base max-w-xl">
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
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl border border-white/20 transition-all inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Explore Recent Books
              </button>
            </div>
          </div>
          
          <div className="hidden lg:block w-72 h-44 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative">
            <div className="absolute top-4 right-4 text-emerald-400 flex items-center gap-1.5 text-xs font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Open Today
            </div>
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
      </div>

      {/* Library Stats Board */}
      <div id="library-metrics-grid" className="max-w-md">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-2 -bottom-2 text-slate-50 dark:text-slate-800/20 opacity-40 group-hover:scale-110 transition-transform">
              <BookOpen className="w-24 h-24 stroke-[0.5]" />
            </div>
            <div className="text-slate-400 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</div>
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2 group-hover:text-red-800 dark:group-hover:text-red-400 transition-colors">{stat.value}</div>
            <p className="text-slate-500 dark:text-slate-300 text-xs leading-relaxed relative z-10">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Main Split: Notice Board and Rules */}
      <div id="notice-rules-split-view" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Notice Board & PM Shri Announcements */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
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
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              Mumbai Sector
            </span>
          </div>

          <div className="space-y-4">
            {notices.map((notice) => (
              <div 
                key={notice.id} 
                onClick={() => setSelectedNotice(notice)}
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
                    <p className="text-slate-500 dark:text-slate-300 text-sm line-clamp-1">{notice.content}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-400">
                      <span>{notice.date}</span>
                      <span>•</span>
                      <span className="text-red-700 dark:text-red-400 font-medium">{notice.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex md:flex-col justify-between items-end md:w-1/4 gap-2 border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-2 md:pt-0">
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
              </div>
            ))}
          </div>
        </div>

        {/* Library Rules Panel */}
        <div className="bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/40 dark:to-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-6">
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
              <div key={idx} className="flex gap-3 text-sm">
                <CheckCircle2 className="w-4 h-4 text-red-800 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">{rule}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Librarian Profile and Welcome Message */}
      <div id="librarian-welcome-message-panel" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 shadow-sm">
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
      </div>

      {/* Selected Notice Dialog Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-slate-100"
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
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">{selectedNotice.title}</h3>
            <div className="text-xs text-slate-400 mb-4 font-mono">{selectedNotice.date}</div>
            
            <p className="text-slate-600 leading-relaxed text-sm mb-6">{selectedNotice.content}</p>
            
            <div className="flex justify-end pt-4 border-t border-slate-100">
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
    </div>
  );
}
