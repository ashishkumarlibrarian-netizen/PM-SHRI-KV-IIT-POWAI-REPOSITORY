import { uploadFile } from "../lib/upload";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Download, BookMarked, Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";

interface MagazineIssue {
  id: string;
  title: string;
  description: string;
  coverColor: string;
  coverImage?: string;
  date: string;
  readLink?: string;
}

export default function MagazineTab({ isAdmin }: { isAdmin?: boolean }) {
  const [issues, setIssues] = useState<MagazineIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<MagazineIssue | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverColor: "bg-indigo-600",
    coverImage: "",
    date: "",
    readLink: ""
  });

  useEffect(() => {
    fetchMagazines();
  }, []);

  const fetchMagazines = async () => {
    try {
      const res = await fetch("/api/magazines");
      const data = await res.json();
      if (Array.isArray(data)) {
        setIssues(data);
      }
    } catch (err) {
      console.error("Failed to fetch magazines:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("kv_library_token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    try {
      const isUpdate = !!currentEdit;
      const url = isUpdate ? `/api/magazines/${currentEdit.id}` : "/api/magazines";
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!res.ok) throw new Error("Failed to save");
      
      setIsEditing(false);
      setCurrentEdit(null);
      fetchMagazines();
    } catch (err) {
      console.error(err);
      alert("Error saving magazine");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this issue?")) return;
    
    const token = localStorage.getItem("kv_library_token");
    try {
      const res = await fetch(`/api/magazines/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setIssues(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAdd = () => {
    setFormData({
      title: "",
      description: "",
      coverColor: "bg-indigo-600",
      coverImage: "",
      date: "",
      readLink: ""
    });
    setCurrentEdit(null);
    setIsEditing(true);
  };

  const openEdit = (issue: MagazineIssue) => {
    setFormData({
      title: issue.title,
      description: issue.description,
      coverColor: issue.coverColor || "bg-indigo-600",
      coverImage: issue.coverImage || "",
      date: issue.date,
      readLink: issue.readLink || ""
    });
    setCurrentEdit(issue);
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const publicUrl = await uploadFile(file, 'magazines');
        setFormData(prev => ({ ...prev, coverImage: publicUrl }));
      } catch (err: any) {
        console.error("Upload failed:", err);
        alert(`Upload failed: ${err.message || err}`);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto py-8 px-4 relative"
    >
      <div className="flex flex-col items-center justify-center mb-12 text-center relative">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
          <BookMarked className="w-8 h-8 text-slate-900" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 tracking-tight mb-4 font-serif uppercase">
          Caravan Quarterly
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          The official student-led magazine of PM Shri KV IIT Powai. 
          Explore the creative voices, achievements, and stories of our scholars.
        </p>
        
        {isAdmin && (
          <button 
            onClick={openAdd}
            className="absolute top-0 right-0 md:mt-4 md:mr-4 bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" /> Add Issue
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {issues.map((issue) => (
              <motion.div 
                key={issue.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex flex-col group shadow-xl relative"
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(issue)} className="p-1.5 bg-sky-500/80 hover:bg-sky-500 text-white rounded-md backdrop-blur-sm transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(issue.id)} className="p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md backdrop-blur-sm transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                <div className={`h-64 ${issue.coverColor || 'bg-slate-700'} relative flex flex-col justify-between overflow-hidden bg-cover bg-center`}
                     style={issue.coverImage ? { backgroundImage: `url(${issue.coverImage})` } : {}}>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                  
                  {!issue.coverImage && (
                    <div className="absolute -right-6 -top-6 text-white/10 rotate-12 pointer-events-none">
                      <BookOpen className="w-40 h-40" />
                    </div>
                  )}

                  <div className="relative z-10 p-6 flex justify-between items-start h-full flex-col">
                    <div className="w-full flex justify-between items-start">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur text-white text-xs font-bold rounded">
                        {issue.date}
                      </span>
                    </div>
                    
                    {!issue.coverImage && (
                      <div className="text-white font-serif font-bold text-2xl leading-tight opacity-90 drop-shadow-md">
                        CARAVAN<br />QUARTERLY
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-slate-100 mb-2 text-lg leading-tight">{issue.title}</h3>
                  <p className="text-slate-400 text-sm mb-4 flex-grow line-clamp-3">{issue.description}</p>
                  
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-700/50">
                    {issue.readLink ? (
                      <a href={issue.readLink} target="_blank" rel="noopener noreferrer" className="flex-grow bg-slate-700 hover:bg-amber-500 hover:text-slate-900 text-slate-200 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <BookOpen className="w-4 h-4" /> Read Issue
                      </a>
                    ) : (
                      <button className="flex-grow bg-slate-700 hover:bg-amber-500 hover:text-slate-900 text-slate-200 text-sm font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                        <BookOpen className="w-4 h-4" /> Not Available
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-100">
                  {currentEdit ? "Edit Issue" : "Add New Issue"}
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Vol. 1, Issue 5 - Spring 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date String</label>
                  <input
                    required
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. March 2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 min-h-[100px]"
                    placeholder="Short description of the issue..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">External Read Link (FlipHTML5/PDF URL)</label>
                  <input
                    type="url"
                    value={formData.readLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, readLink: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="https://..."
                  />
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image (Optional)</label>
                  {formData.coverImage ? (
                    <div className="relative h-40 rounded-xl overflow-hidden mb-2 group">
                      <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1">
                          <Trash2 className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-24 px-4 transition bg-slate-800 border-2 border-slate-700 border-dashed rounded-xl appearance-none cursor-pointer hover:border-amber-500 focus:outline-none mb-2">
                      <span className="flex items-center space-x-2 text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                        <span className="font-medium text-sm">Upload Cover Image</span>
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>

                {!formData.coverImage && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Or choose a fallback cover color</label>
                    <div className="flex gap-2 flex-wrap">
                      {["bg-indigo-600", "bg-rose-600", "bg-emerald-600", "bg-amber-600", "bg-sky-600", "bg-purple-600"].map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, coverColor: color }))}
                          className={`w-8 h-8 rounded-full ${color} ${formData.coverColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-50 hover:opacity-100'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold transition-colors shadow-lg shadow-amber-500/20">
                    Save Issue
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
