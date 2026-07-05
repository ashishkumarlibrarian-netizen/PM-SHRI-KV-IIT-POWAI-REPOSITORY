import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ExternalLink, Edit2, Check, X, Shield, Plus, Trash2 } from "lucide-react";

interface QuizLink {
  id: string;
  title: string;
  url: string;
}

export default function QuizCornerTab({ currentUser }: { currentUser: any }) {
  const [links, setLinks] = useState<QuizLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const isAdmin = currentUser && (
    currentUser.role === "admin" || 
    currentUser.fullName === "Ashish Kumar" || 
    currentUser.email === "ashishkumar.librarian@gmail.com"
  );

  useEffect(() => {
    fetchLinks();
  }, []);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedback({ text, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/quiz-links");
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Failed to fetch quiz links:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    try {
      const token = localStorage.getItem("kv_library_token");
      const res = await fetch("/api/quiz-links", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ title: newTitle.trim(), url: newUrl.trim() }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewUrl("");
        fetchLinks();
        showFeedback("Link added successfully!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        showFeedback(errData.error || "Failed to add link.", "error");
      }
    } catch (error) {
      console.error("Failed to add link:", error);
      showFeedback("An error occurred while adding the link.", "error");
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const token = localStorage.getItem("kv_library_token");
      const res = await fetch(`/api/quiz-links/${id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}` 
        }
      });
      if (res.ok) {
        setConfirmingDeleteId(null);
        fetchLinks();
        showFeedback("Link deleted successfully!", "success");
      } else {
        const errData = await res.json().catch(() => ({}));
        showFeedback(errData.error || "Failed to delete link.", "error");
      }
    } catch (error) {
      console.error("Failed to delete link:", error);
      showFeedback("An error occurred while deleting the link.", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl mx-auto py-8 px-4"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Quiz Corner</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Test your knowledge with these interactive quizzes and competitions!
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isEditing 
                ? "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                : "bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20"
            }`}
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? "Done Editing" : "Manage Links"}
          </button>
        )}
      </div>

      {isAdmin && isEditing && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-amber-200 dark:border-amber-900/30 mb-8">
          <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-bold text-sm">Admin Controls</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Link Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. MyGov Quiz"
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleAddLink}
            disabled={!newTitle.trim() || !newUrl.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <div key={link.id} className="relative group">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-lg transition-all h-full"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors pr-6">
                    {link.title}
                  </h3>
                  <ExternalLink className="w-5 h-5 text-slate-400 flex-shrink-0 group-hover:text-amber-500 transition-colors" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-1">
                  {link.url}
                </p>
              </a>
              
              {isAdmin && isEditing && (
                <div className="absolute -top-2 -right-2 z-30 flex items-center gap-1.5">
                  {confirmingDeleteId === link.id ? (
                    <div className="flex items-center gap-1 bg-slate-900 dark:bg-slate-950 p-1 rounded-xl shadow-lg border border-slate-700/50">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteLink(link.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-bold shadow-md hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                        title="Confirm deletion"
                      >
                        <Check className="w-3 h-3" /> Yes
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmingDeleteId(null);
                        }}
                        className="p-1 bg-slate-600 text-slate-100 rounded-lg hover:bg-slate-500 active:scale-95 transition-all cursor-pointer text-[10px] font-bold"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setConfirmingDeleteId(link.id);
                      }}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                      title="Delete link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {links.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-500">
               No quiz links available yet.
             </div>
          )}
        </div>
      )}

      {feedback && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold transition-all duration-300 animate-bounce ${
          feedback.type === "success" 
            ? "bg-emerald-500 text-white border-emerald-400"
            : "bg-red-500 text-white border-red-400"
        }`}>
          {feedback.text}
        </div>
      )}
    </motion.div>
  );
}
