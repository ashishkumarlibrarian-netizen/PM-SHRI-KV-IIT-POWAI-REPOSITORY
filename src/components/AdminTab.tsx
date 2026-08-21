import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Lightbulb, UserCircle, Trash2, Edit2, Pin, Shield, Save, X, Plus, 
  ArrowUp, ArrowDown, Search, Globe, AlertCircle, ChevronDown, ChevronUp, BookOpen, 
  School, Library, FileText, Video, Database, GraduationCap, Award, Sparkles, Star, 
  Bookmark, Briefcase, Loader2, Check 
} from "lucide-react";
import { SocialFeedPost } from "../types";
import { uploadFile } from "../lib/upload";
import ReaderClubManager from "./ReaderClubManager";
import LibraryShowcaseManager from "./LibraryShowcaseManager";
import LibraryAchieversManager from "./LibraryAchieversManager";
import { ErrorBoundary } from "./ErrorBoundary";

function ThoughtManager({ thoughts, fetchData, handleDeleteThought }: any) {
  const [editingThought, setEditingThought] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "", thought: "", author: "", is_active: false,
    icon: "✨", bg_color: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    text_color: "text-amber-400", border_color: "border-amber-500/30",
    gradient_start: "from-amber-400", gradient_end: "to-amber-600", display_order: 0
  });

  const resetForm = () => {
    setFormData({
      title: "", thought: "", author: "", is_active: false,
      icon: "✨", bg_color: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      text_color: "text-amber-400", border_color: "border-amber-500/30",
      gradient_start: "from-amber-400", gradient_end: "to-amber-600", display_order: 0
    });
    setEditingThought(null);
    setIsAdding(false);
  };

  const handleEdit = (t: any) => {
    setFormData({
      title: t.title || "", thought: t.thought || "", author: t.author || "", is_active: t.is_active || false,
      icon: t.icon || "✨", bg_color: t.bg_color || "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      text_color: t.text_color || "text-amber-400", border_color: t.border_color || "border-amber-500/30",
      gradient_start: t.gradient_start || "from-amber-400", gradient_end: t.gradient_end || "to-amber-600", display_order: t.display_order || 0
    });
    setEditingThought(t);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingThought ? `/api/thoughts/${editingThought.id}` : "/api/thoughts";
    const method = editingThought ? "PUT" : "POST";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    resetForm();
    fetchData();
  };

  const toggleActive = async (t: any) => {
    await fetch(`/api/thoughts/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, is_active: !t.is_active })
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {!isAdding ? (
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">All Thoughts</h3>
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Thought
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{editingThought ? 'Edit Thought' : 'Add New Thought'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Basic Info</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title (e.g., Motivation)" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" required />
                <textarea value={formData.thought} onChange={e => setFormData({...formData, thought: e.target.value})} placeholder="Thought text..." className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-[100px]" required />
                <input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="Author" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" required />
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Design & Colors (Tailwind Classes)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="Icon (emoji)" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                  <input value={formData.text_color} onChange={e => setFormData({...formData, text_color: e.target.value})} placeholder="Text Color" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                  <input value={formData.bg_color} onChange={e => setFormData({...formData, bg_color: e.target.value})} placeholder="Background Color" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 col-span-2" />
                  <input value={formData.border_color} onChange={e => setFormData({...formData, border_color: e.target.value})} placeholder="Border Color" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 col-span-2" />
                  <input value={formData.gradient_start} onChange={e => setFormData({...formData, gradient_start: e.target.value})} placeholder="Gradient Start" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                  <input value={formData.gradient_end} onChange={e => setFormData({...formData, gradient_end: e.target.value})} placeholder="Gradient End" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="rounded text-amber-500 w-5 h-5 focus:ring-amber-500" />
                  Set as Active Thought
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> {editingThought ? 'Update Thought' : 'Save Thought'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </form>

            {/* Live Preview */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Live Preview</label>
              <div className={`w-full ${formData.bg_color} backdrop-blur-xl rounded-2xl p-8 border ${formData.border_color} relative overflow-hidden shadow-sm`}>
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b ${formData.gradient_start} ${formData.gradient_end} shadow-[0_0_10px_rgba(245,158,11,0.5)]`}></div>
                <div className={`absolute top-0 right-0 w-64 h-full bg-gradient-to-l ${formData.gradient_start} to-transparent opacity-50`}></div>
                
                <div className="flex flex-col gap-6 relative z-10">
                  <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${formData.text_color}`}>
                     <span className="text-xl">{formData.icon}</span> {formData.title || 'Title Preview'}
                  </div>
                  
                  <div className="border-l border-current/10 pl-6 py-2">
                    <p className={`text-lg italic font-medium leading-relaxed ${formData.text_color ? 'text-current opacity-90' : 'text-slate-200'}`}>
                      "{formData.thought || 'Thought text preview will appear here...'}"
                    </p>
                    <p className={`text-sm font-semibold mt-4 flex items-center gap-2 ${formData.text_color ? 'text-current opacity-70' : 'text-slate-400'}`}>
                      <span className="w-4 h-[1px] bg-current opacity-50"></span>
                      {formData.author || 'Author Name'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {!isAdding && (
        <div className="space-y-4">
          {thoughts.length === 0 && (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              No thoughts added yet. Create one to get started!
            </div>
          )}
          {thoughts.map((t: any) => (
            <div key={t.id} className={`p-5 border rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-colors ${t.is_active ? 'border-amber-500 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.icon || '✨'}</span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{t.title}</h4>
                  {t.is_active && <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] uppercase tracking-widest font-bold rounded-full">Active</span>}
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic">"{t.thought}"</p>
                <p className="text-sm text-slate-500 font-medium">— {t.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${t.is_active ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-900/20'}`}>
                  {t.is_active ? 'Active' : 'Make Active'}
                </button>
                <button onClick={() => handleEdit(t)} className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteThought(t.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



const FIXED_ICONS = [
  { name: "Globe", label: "Globe" },
  { name: "BookOpen", label: "Book Open" },
  { name: "School", label: "School" },
  { name: "Library", label: "Library" },
  { name: "FileText", label: "Document" },
  { name: "Database", label: "Database" },
  { name: "Video", label: "Video" },
  { name: "GraduationCap", label: "Cap" },
  { name: "Award", label: "Award" },
  { name: "Sparkles", label: "Sparkles" },
  { name: "Star", label: "Star" },
  { name: "Bookmark", label: "Bookmark" },
  { name: "Briefcase", label: "Briefcase" }
];

function QuickLinksManager() {
  const [links, setLinks] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: 'Globe',
    category: '',
    description: '',
    badge: '',
    display_order: 0,
    open_new_tab: true,
    is_active: true,
    newCategoryName: ''
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string; type: 'link' | 'category' } | null>(null);
  const [categoryModal, setCategoryModal] = useState<{ mode: 'rename'; category: string; value?: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'School': return <School className="w-4 h-4" />;
      case 'Library': return <Library className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Video': return <Video className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'Award': return <Award className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Star': return <Star className="w-4 h-4" />;
      case 'Bookmark': return <Bookmark className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/quick_links");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Failed to load links");
      }
      const data = await res.json();
      const loadedLinks = data || [];
      setLinks(loadedLinks);
      
      // Auto select category if form category is empty
      if (loadedLinks.length > 0 && !formData.category) {
        const cats = Array.from(new Set(loadedLinks.map((l: any) => l.category).filter(Boolean))) as string[];
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, category: prev.category || cats[0] }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load links");
      showToast(err.message || "Failed to load links", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const selectedCategory = formData.category === "--create-new--" 
        ? formData.newCategoryName.trim() 
        : formData.category;

      if (!selectedCategory) {
        throw new Error("Please specify or select a category");
      }

      const payload = {
        title: formData.title,
        url: formData.url,
        icon: formData.icon,
        category: selectedCategory,
        description: formData.description,
        badge: formData.badge,
        display_order: formData.display_order,
        open_new_tab: formData.open_new_tab,
        is_active: formData.is_active
      };

      const url = editingId ? `/api/quick_links/${editingId}` : "/api/quick_links";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Failed to save link");
      }
      
      showToast(editingId ? "Link updated successfully!" : "Link added successfully!", 'success');
      setEditingId(null);
      setFormData({
        title: '',
        url: '',
        icon: 'Globe',
        category: selectedCategory,
        description: '',
        badge: '',
        display_order: 0,
        open_new_tab: true,
        is_active: true,
        newCategoryName: ''
      });
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save link");
      showToast(err.message || "Failed to save link", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (link: any) => {
    setEditingId(link.id);
    setFormData({
      title: link.title || "",
      url: link.url || "",
      icon: link.icon || "Globe",
      category: link.category || "",
      description: link.description || "",
      badge: link.badge || "",
      display_order: link.display_order || 0,
      open_new_tab: link.open_new_tab !== false,
      is_active: link.is_active !== false,
      newCategoryName: ""
    });
    // Scroll form into view
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDeleteLink = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/quick_links/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Failed to delete link");
      }
      showToast("Link deleted successfully!", 'success');
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete link");
      showToast(err.message || "Failed to delete link", 'error');
    } finally {
      setSaving(false);
      setDeleteConfirm(null);
    }
  };

  const handleRenameCategory = async (oldCategory: string, newCategoryName: string) => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/quick_links_category/rename", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldCategory, newCategory: newCategoryName.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Failed to rename category");
      }
      showToast(`Category renamed from "${oldCategory}" to "${newCategoryName.trim()}"`, 'success');
      if (formData.category === oldCategory) {
        setFormData(prev => ({ ...prev, category: newCategoryName.trim() }));
      }
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to rename category");
      showToast(err.message || "Failed to rename category", 'error');
    } finally {
      setSaving(false);
      setCategoryModal(null);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/quick_links_category/${encodeURIComponent(categoryName)}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Failed to delete category");
      }
      showToast(`Category "${categoryName}" and all its links deleted!`, 'success');
      if (formData.category === categoryName) {
        setFormData(prev => ({ ...prev, category: "" }));
      }
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to delete category");
      showToast(err.message || "Failed to delete category", 'error');
    } finally {
      setSaving(false);
      setDeleteConfirm(null);
    }
  };

  const toggleActive = async (link: any) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/quick_links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, is_active: !link.is_active })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Failed to toggle active state");
      }
      showToast(link.is_active ? "Link disabled successfully" : "Link enabled successfully", 'success');
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to toggle state");
      showToast(err.message || "Failed to toggle state", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (link: any, direction: 'up' | 'down') => {
    setError(null);
    setSaving(true);
    try {
      const catLinks = links
        .filter(l => l.category === link.category)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      const targetIdx = catLinks.findIndex(l => l.id === link.id);
      if (targetIdx === -1) return;

      const swapIdx = direction === 'up' ? targetIdx - 1 : targetIdx + 1;
      if (swapIdx < 0 || swapIdx >= catLinks.length) return;

      const swapLink = catLinks[swapIdx];

      const currentOrder = link.display_order || 0;
      const swapOrder = swapLink.display_order || 0;

      let newCurrentOrder = swapOrder;
      let newSwapOrder = currentOrder;

      if (currentOrder === swapOrder) {
        newCurrentOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
      }

      const res1 = await fetch(`/api/quick_links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, display_order: newCurrentOrder })
      });

      const res2 = await fetch(`/api/quick_links/${swapLink.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...swapLink, display_order: newSwapOrder })
      });

      if (!res1.ok || !res2.ok) {
        throw new Error("Failed to reorder links in database");
      }

      showToast("Display order updated!", 'success');
      fetchLinks();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to reorder");
      showToast(err.message || "Failed to reorder", 'error');
    } finally {
      setSaving(false);
    }
  };

  const dynamicCategories = Array.from(new Set(links.map(l => l.category).filter(Boolean))) as string[];
  dynamicCategories.sort((a, b) => a.localeCompare(b));

  const filteredLinks = links.filter(l => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (l.title || "").toLowerCase().includes(q) ||
      (l.category || "").toLowerCase().includes(q) ||
      (l.description || "").toLowerCase().includes(q) ||
      (l.url || "").toLowerCase().includes(q)
    );
  });

  const adminCategoriesMap = new Map<string, any[]>();
  filteredLinks.forEach(l => {
    const cat = l.category || "General Resources";
    if (!adminCategoriesMap.has(cat)) {
      adminCategoriesMap.set(cat, []);
    }
    adminCategoriesMap.get(cat)!.push(l);
  });

  const adminCategories: { title: string; links: any[] }[] = [];
  adminCategoriesMap.forEach((linksList, title) => {
    linksList.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    adminCategories.push({ title, links: linksList });
  });
  adminCategories.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-8 relative">
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Grid for Creation and Category Management */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation/Edit Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {editingId ? <Edit2 className="w-5 h-5 text-amber-500" /> : <Plus className="w-5 h-5 text-amber-500" />}
              {editingId ? 'Edit Link' : 'Add New Link'}
            </h3>
            {saving && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Link Title *</label>
              <input 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="e.g. CBSE Academic Syllabus" 
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">URL *</label>
              <input 
                required 
                type="url" 
                value={formData.url} 
                onChange={e => setFormData({...formData, url: e.target.value})} 
                placeholder="e.g. https://cbseacademic.nic.in" 
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Category *</label>
              <select 
                required 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="" disabled>-- Select Category --</option>
                {dynamicCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="--create-new--" className="text-amber-500 font-bold">+ Create New Category...</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Icon *</label>
              <select 
                required 
                value={formData.icon} 
                onChange={e => setFormData({...formData, icon: e.target.value})} 
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {FIXED_ICONS.map(ic => (
                  <option key={ic.name} value={ic.name}>{ic.label}</option>
                ))}
              </select>
            </div>

            {formData.category === "--create-new--" && (
              <div className="col-span-1 md:col-span-2 bg-amber-500/5 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                <label className="block text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">New Category Name *</label>
                <input 
                  required 
                  value={formData.newCategoryName} 
                  onChange={e => setFormData({...formData, newCategoryName: e.target.value})} 
                  placeholder="e.g. AI Tools, Question Papers, Competitive Exams" 
                  className="w-full p-2.5 border border-amber-400/50 dark:border-amber-700/50 rounded-lg dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" 
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Badge (Optional)</label>
              <input 
                value={formData.badge} 
                onChange={e => setFormData({...formData, badge: e.target.value})} 
                placeholder="e.g. NEW, UPDATED, LIVE, RECOMMENDED" 
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Display Order</label>
              <input 
                type="number" 
                value={formData.display_order} 
                onChange={e => setFormData({...formData, display_order: parseInt(e.target.value) || 0})} 
                placeholder="Display Order (lower numbers appear first)" 
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" 
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="e.g. Official repository of sample question papers for secondary board classes." 
                rows={2}
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500" 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={formData.is_active} 
                  onChange={e => setFormData({...formData, is_active: e.target.checked})} 
                  className="rounded text-amber-500 w-4 h-4 focus:ring-amber-500 border-slate-300" 
                />
                Active Toggle
              </label>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={formData.open_new_tab} 
                  onChange={e => setFormData({...formData, open_new_tab: e.target.checked})} 
                  className="rounded text-amber-500 w-4 h-4 focus:ring-amber-500 border-slate-300" 
                />
                Open in New Tab
              </label>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={saving}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Update Link' : 'Add Link'}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={() => { 
                    setEditingId(null); 
                    setFormData({ title: '', url: '', icon: 'Globe', category: dynamicCategories[0] || '', description: '', badge: '', display_order: 0, open_new_tab: true, is_active: true, newCategoryName: '' }); 
                  }} 
                  className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Dynamic Category Manager */}
        <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-4 shadow-sm h-fit">
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Category Manager
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rename, reorganize, or bulk delete categories dynamically.
            </p>
          </div>
          
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {dynamicCategories.map(cat => {
              const linkCount = links.filter(l => l.category === cat).length;
              return (
                <div key={cat} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm block truncate">{cat}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">{linkCount} {linkCount === 1 ? 'link' : 'links'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                      type="button"
                      onClick={() => setCategoryModal({ mode: 'rename', category: cat, value: cat })}
                      className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 rounded-lg border border-slate-200/40 dark:border-slate-700 transition-colors"
                      title="Rename Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => setDeleteConfirm({ id: '', title: cat, type: 'category' })}
                      className="p-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg border border-slate-200/40 dark:border-slate-700 transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {dynamicCategories.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50">
                No categories created yet. Add a link above to spawn one!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Link List grouped by Category */}
      <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Existing Links ({links.length})</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Filter, reorder within categories, edit, or delete links.</p>
          </div>
          {/* Search Filter for Manager */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter links in manager..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Fetching live links...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {adminCategories.map((catGroup) => (
              <div key={catGroup.title} className="space-y-2">
                <h4 className="text-xs font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-wider px-1">
                  {catGroup.title} ({catGroup.links.length})
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {catGroup.links.map((link, idx) => (
                    <div 
                      key={link.id} 
                      className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm bg-white dark:bg-slate-900 ${
                        link.is_active 
                          ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700' 
                          : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0 flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500 dark:text-amber-400 border border-slate-200/60 dark:border-slate-700 flex-shrink-0 mt-0.5">
                          {getIconComponent(link.icon)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{link.title}</span>
                            {link.badge && (
                              <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                {link.badge}
                              </span>
                            )}
                            {link.open_new_tab && (
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">New Tab</span>
                            )}
                          </div>
                          {link.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{link.description}</p>
                          )}
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{link.url}</p>
                          <div className="text-[9px] text-slate-400 mt-1 font-medium flex gap-3">
                            <span>Icon: <span className="text-slate-600 dark:text-slate-300 font-bold">{link.icon || "Globe"}</span></span>
                            <span>Display Order: <span className="text-slate-600 dark:text-slate-300 font-extrabold">{link.display_order || 0}</span></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0 justify-end">
                        <div className="flex gap-1">
                          <button 
                            disabled={idx === 0} 
                            onClick={() => handleReorder(link, 'up')} 
                            className="p-1.5 bg-slate-50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg disabled:opacity-30 border border-slate-200/50 dark:border-slate-700"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            disabled={idx === catGroup.links.length - 1} 
                            onClick={() => handleReorder(link, 'down')} 
                            className="p-1.5 bg-slate-50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg disabled:opacity-30 border border-slate-200/50 dark:border-slate-700"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => toggleActive(link)} 
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                            link.is_active 
                              ? 'bg-emerald-50 text-emerald-750 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                              : 'bg-slate-50 text-slate-500 border-slate-200/40 dark:bg-slate-850 dark:text-slate-400 dark:border-slate-850'
                          }`}
                        >
                          {link.is_active ? 'Enabled' : 'Disabled'}
                        </button>
                        <button 
                          onClick={() => handleEdit(link)} 
                          className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
                          title="Edit Link"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm({ id: link.id, title: link.title, type: 'link' })} 
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-100 dark:border-rose-950/20 transition-colors"
                          title="Delete Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {adminCategories.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-sm bg-slate-50/20">
                No links matching filter criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Success/Error Toasts */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all ${
          toast.type === 'success' 
            ? 'bg-emerald-600/90 text-white border-emerald-400' 
            : 'bg-rose-600/90 text-white border-rose-400'
        }`}>
          {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Overlays */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h4 className="font-extrabold text-lg">Confirm Deletion</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete the {deleteConfirm.type} <span className="font-extrabold text-slate-800 dark:text-slate-100">"{deleteConfirm.title}"</span>? 
              {deleteConfirm.type === 'category' && " This will also delete all links that belong to this category."} This action is irreversible.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setDeleteConfirm(null)} 
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'link') {
                    handleDeleteLink(deleteConfirm.id);
                  } else {
                    handleDeleteCategory(deleteConfirm.title);
                  }
                }} 
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors font-bold shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Rename Dialog */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h4 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Rename Category</h4>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Current Name</label>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm select-all">
                {categoryModal.category}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">New Category Name *</label>
              <input 
                required
                value={categoryModal.value || ""} 
                onChange={e => setCategoryModal({ ...categoryModal, value: e.target.value })}
                placeholder="Enter new name..." 
                className="w-full p-2.5 border rounded-lg dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm focus:ring-2 focus:ring-amber-500" 
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setCategoryModal(null)} 
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors font-semibold"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => handleRenameCategory(categoryModal.category, categoryModal.value || "")} 
                disabled={!categoryModal.value?.trim()}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors font-bold shadow-sm"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTab() {
  const [activeSection, setActiveSection] = useState("thoughts");
  
  // Thoughts
  const [thoughts, setThoughts] = useState<any[]>([]);
  
  // Posts
  const [posts, setPosts] = useState<SocialFeedPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);
  
  // Avatars
  const [avatars, setAvatars] = useState<any[]>([]);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    if (activeSection === "thoughts") {
      const res = await fetch("/api/thoughts/all");
      if (res.ok) setThoughts(await res.json());
    } else if (activeSection === "posts") {
      const res = await fetch("/api/social/posts");
      if (res.ok) setPosts(await res.json());
    } else if (activeSection === "avatars") {
      const res = await fetch("/api/admin/avatars_extended");
      if (res.ok) setAvatars(await res.json());
    }
  };

  const handleDeleteThought = async (id: string) => {
    await fetch(`/api/thoughts/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleDeletePost = async (id: string) => {
    await fetch(`/api/social/posts/${id}`, { method: "DELETE" });
    fetchData();
  };

  const toggleHidePost = async (post: any) => {
    await fetch(`/api/library_posts/${post.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_hidden: !post.is_hidden }) });
    fetchData();
  };

  const togglePinPost = async (post: any) => {
    await fetch(`/api/library_posts/${post.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_pinned: !post.is_pinned }) });
    fetchData();
  };

  const handleDeleteAvatar = async (userId: string) => {
    await fetch(`/api/admin/avatars_extended/${userId}`, { method: "DELETE" });
    fetchData();
  };

  const filteredPosts = posts.filter(p => {
    if (ratingFilter > 0 && p.rating !== ratingFilter) return false;
    if (searchQuery && !p.content?.toLowerCase().includes(searchQuery.toLowerCase()) && !p.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase()) && !p.studentName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Hub</h2>
        </div>
        
        <div className="flex flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          {['thoughts', 'quick_links', 'readers_club', 'showcase', 'achievers', 'posts', 'avatars'].map(sec => (
            <button key={sec} onClick={() => setActiveSection(sec)} className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors ${activeSection === sec ? "bg-amber-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}>
              {sec === 'thoughts' ? 'Thought Manager' : sec === 'quick_links' ? 'Quick Links Manager' : sec === 'readers_club' ? 'Reader Club Manager' : sec === 'showcase' ? 'Library Showcase Manager' : sec === 'achievers' ? 'Library Achievers Manager' : sec === 'posts' ? 'Social Hub Manager' : 'Avatar Manager'}
            </button>
          ))}
        </div>

        {activeSection === "thoughts" && (
          <ThoughtManager thoughts={thoughts} fetchData={fetchData} handleDeleteThought={handleDeleteThought} />
        )}
        
        {activeSection === "quick_links" && (
          <QuickLinksManager />
        )}

        {activeSection === "readers_club" && (
          <ReaderClubManager />
        )}

        {activeSection === "showcase" && (
          <ErrorBoundary componentName="Library Showcase Manager">
            <LibraryShowcaseManager />
          </ErrorBoundary>
        )}

        {activeSection === "achievers" && (
          <ErrorBoundary componentName="Library Achievers Manager">
            <LibraryAchieversManager />
          </ErrorBoundary>
        )}

        {activeSection === "posts" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
              <input type="text" placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full md:w-64 p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700" />
              <select value={ratingFilter} onChange={(e) => setRatingFilter(parseInt(e.target.value))} className="w-full md:w-auto p-2 border rounded-lg dark:bg-slate-900 dark:border-slate-700">
                <option value={0}>All Ratings</option>
                {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post: any) => (
                <div key={post.id} className={`p-4 border rounded-xl space-y-2 ${post.is_hidden ? 'opacity-50 bg-slate-100 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'} ${post.is_pinned ? 'border-amber-500' : 'border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm text-slate-800 dark:text-slate-100">
                      {post.studentName} {post.is_pinned && '📌'}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => togglePinPost(post)} className="text-amber-500 hover:text-amber-600 text-xs font-semibold">{post.is_pinned ? 'Unpin' : 'Pin'}</button>
                      <button onClick={() => toggleHidePost(post)} className="text-slate-500 hover:text-slate-600 text-xs font-semibold">{post.is_hidden ? 'Show' : 'Hide'}</button>
                      <button onClick={() => handleDeletePost(post.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-amber-500">{post.bookTitle} • {post.rating} Stars</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{post.content}</p>
                </div>
              ))}
              {filteredPosts.length === 0 && <div className="col-span-full text-center py-8 text-slate-500">No posts found</div>}
            </div>
          </div>
        )}

        {activeSection === "avatars" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {avatars.map(avatar => (
                <div key={avatar.id} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-800">
                  <div className="aspect-square relative cursor-pointer" onClick={() => setPreviewAvatar(avatar.url)}>
                    <img src={avatar.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <span className="text-white text-sm font-medium">Preview</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm truncate">{avatar.studentName}</p>
                    <p className="text-xs text-slate-500 truncate mt-1">Path: {avatar.path}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-slate-400">{new Date(avatar.uploadDate).toLocaleDateString()}</span>
                      <button onClick={() => handleDeleteAvatar(avatar.id)} className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs font-semibold">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
              {avatars.length === 0 && <div className="col-span-full text-center py-8 text-slate-500">No avatars found</div>}
            </div>
            {previewAvatar && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewAvatar(null)}>
                <img src={previewAvatar} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
