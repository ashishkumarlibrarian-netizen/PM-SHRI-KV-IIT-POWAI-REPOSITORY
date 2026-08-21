import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, ArrowUp, ArrowDown, GripVertical, Image as ImageIcon, X, Save, Search, Filter, User, Pin, PinOff } from "lucide-react";


export default function LibraryAchieversManager() {
  const [activeTab, setActiveTab] = useState<"categories" | "achievers">("achievers");
  
  const [categories, setCategories] = useState<any[]>([]);
  const [achievers, setAchievers] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const [editingAchiever, setEditingAchiever] = useState<any>(null);
  const [isAchieverModalOpen, setIsAchieverModalOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'achiever'; id: string; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('kv_library_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [catsRes, achRes] = await Promise.all([
        fetch('/api/library-achievers/categories', { headers, cache: 'no-store' }),
        fetch('/api/library-achievers', { headers, cache: 'no-store' })
      ]);
      
      if (catsRes.ok) {
        const catsData = await catsRes.json();
        setCategories(Array.isArray(catsData) ? catsData : (catsData.data || []));
      } else {
        const err = await catsRes.json().catch(() => ({}));
        console.error("Failed to load categories:", err);
        setError(`Failed to load categories: ${err.message || err.error || catsRes.statusText}`);
      }
      
      if (achRes.ok) {
        const achData = await achRes.json();
        setAchievers(Array.isArray(achData) ? achData : (achData.data || []));
      } else {
        const err = await achRes.json().catch(() => ({}));
        console.error("Failed to load achievers:", err);
        setError(`Failed to load achievers: ${err.message || err.error || achRes.statusText}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Failed to fetch data: ${err.message}`);
    }
    setIsLoading(false);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const saveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('kv_library_token');
      const method = editingCategory.id ? 'PUT' : 'POST';
      const url = editingCategory.id ? `/api/admin/library-achievers/categories/${editingCategory.id}` : '/api/admin/library-achievers/categories';
      
      const payload = { ...editingCategory };
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || res.statusText || "Failed to save category");
      }
      
      showSuccess("Category saved successfully");
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (err: any) {
      setError(`Failed to save category: ${err.message}`);
      console.error(err);
    }
  };

  const executeDeleteCategory = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const token = localStorage.getItem('kv_library_token');
      const res = await fetch(`/api/admin/library-achievers/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || `Failed to delete category (status: ${res.status})`);
      }
      showSuccess("Category deleted successfully");
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      console.error("Delete category error:", err);
      setError(`Failed to delete category: ${err.message || err}`);
    } finally {
      setDeletingId(null);
    }
  };

  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    // Use local preview before saving
    setEditingAchiever({ ...editingAchiever, profile_photo: URL.createObjectURL(file) });
  };
  

  const saveAchiever = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('kv_library_token');
      const method = editingAchiever.id ? 'PUT' : 'POST';
      const url = editingAchiever.id ? `/api/admin/library-achievers/${editingAchiever.id}` : '/api/admin/library-achievers';
      
      const payload = { ...editingAchiever };
      if (payload.achievement_date === "") {
        payload.achievement_date = null;
      }
      
      if (selectedFile && payload.profile_photo && payload.profile_photo.startsWith('blob:')) {
        delete payload.profile_photo;
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || errData.error || res.statusText || "Failed to save achiever");
      }
      
      const savedAchiever = await res.json();
      
      if (selectedFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("bucket", "library-achievers");
        formData.append("fileName", `members/${savedAchiever.id}/profile.${selectedFile.name.split('.').pop()}`);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        
        if (uploadRes.ok) {
          const { publicUrl: photoUrl } = await uploadRes.json();
          await fetch(`/api/admin/library-achievers/${savedAchiever.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ profile_photo: photoUrl })
          });
        } else {
           const err = await uploadRes.json();
           throw new Error(err.message || err.error || "Failed to upload image");
        }
      }
      
      showSuccess("Achiever saved successfully");
      setIsAchieverModalOpen(false);
      setSelectedFile(null);
      setUploadingImage(false);
      fetchData();
    } catch (err: any) {
      setError(`Failed to save achiever: ${err.message}`);
      console.error(err);
      setUploadingImage(false);
    }
  };

  const executeDeleteAchiever = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      const token = localStorage.getItem('kv_library_token');
      const res = await fetch(`/api/admin/library-achievers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.message || `Failed to delete achiever (status: ${res.status})`);
      }
      showSuccess("Achiever deleted successfully");
      setDeleteConfirm(null);
      await fetchData();
    } catch (err: any) {
      console.error("Delete achiever error:", err);
      setError(`Failed to delete achiever: ${err.message || err}`);
    } finally {
      setDeletingId(null);
    }
  };
  
  
  const moveItem = async (type: 'categories'|'achievers', index: number, direction: 'up' | 'down') => {
    let list = type === 'categories' ? [...categories] : [...achievers];
    
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === list.length - 1)) return;

    const item = list[index];
    const swapItem = list[direction === 'up' ? index - 1 : index + 1];

    if (item.is_pinned !== swapItem.is_pinned) {
      // Cannot reorder across pinned/unpinned boundary
      return;
    }

    // Move in array
    list[index] = swapItem;
    list[direction === 'up' ? index - 1 : index + 1] = item;

    // Normalize display order for the whole list
    list.forEach((el, i) => { el.display_order = i; });
    
    if (type === 'categories') setCategories([...list]);
    else setAchievers([...list]);

    // Save all to DB sequentially
    const token = localStorage.getItem('kv_library_token');
    const endpoint = type === 'categories' ? 'categories' : '';
    const prefix = endpoint ? `/${endpoint}` : '';

    for (const el of list) {
      await fetch(`/api/admin/library-achievers${prefix}/${el.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ display_order: el.display_order })
      });
    }
    
    await fetchData();
  };

  const togglePin = async (type: 'categories'|'achievers', item: any) => {
    const token = localStorage.getItem('kv_library_token');
    const endpoint = type === 'categories' ? 'categories' : '';
    const prefix = endpoint ? `/${endpoint}` : '';
    
    await fetch(`/api/admin/library-achievers${prefix}/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_pinned: !item.is_pinned })
    });
    
    await fetchData();
  };

  
  const isFilterActive = searchQuery !== "" || categoryFilter !== "all";
  const filteredAchievers = achievers.filter(a => {
    const matchesSearch = (a.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (a.achievement_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (a.designation?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || a.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl flex items-center justify-between">
          <p>{error}</p>
          <button onClick={() => setError(null)}><X className="w-5 h-5" /></button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-4 rounded-xl flex items-center justify-between">
          <p>{successMsg}</p>
          <button onClick={() => setSuccessMsg(null)}><X className="w-5 h-5" /></button>
        </div>
      )}

      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("achievers")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "achievers" 
              ? "border-amber-500 text-amber-600 dark:text-amber-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Achievers
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "categories" 
              ? "border-amber-500 text-amber-600 dark:text-amber-400" 
              : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          Categories
        </button>
      </div>

      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Achiever Categories</h3>
            <button 
              onClick={() => {
                setEditingCategory({ name: "", description: "", icon: "Award", display_order: categories.length, is_active: true });
                setIsCategoryModalOpen(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create Category
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-4 font-medium w-12 text-center">Pin</th>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Category Name</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="p-4">
                      <div className="flex flex-col items-center gap-1 w-6">
                        <button onClick={() => moveItem('categories', idx, 'up')} disabled={idx === 0 || categories[idx].is_pinned !== categories[idx-1]?.is_pinned} className="text-slate-400 hover:text-amber-500 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                        <span className="text-xs font-mono">{cat.display_order}</span>
                        <button onClick={() => moveItem('categories', idx, 'down')} disabled={idx === categories.length - 1 || categories[idx].is_pinned !== categories[idx+1]?.is_pinned} className="text-slate-400 hover:text-amber-500 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4 truncate max-w-xs">{cat.description}</td>
                    <td className="p-4">
                      {cat.is_active ? 
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span> :
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"><XCircle className="w-3.5 h-3.5" /> Inactive</span>
                      }
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => { setEditingCategory(cat); setIsCategoryModalOpen(true); }} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })} 
                        disabled={deletingId === cat.id}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete Category"
                      >
                        {deletingId === cat.id ? <span className="text-xs font-bold text-rose-500">...</span> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">No recognition categories have been created yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "achievers" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Library Achievers</h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search achievers..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => {
                  if (categories.length === 0) {
                    alert("Please create a category first.");
                    return;
                  }
                  setEditingAchiever({ 
                    name: "", designation: "", achievement_title: "", description: "", 
                    category_id: categories[0]?.id, display_order: achievers.length, 
                    is_active: true, academic_year: "2026-27" 
                  });
                  setIsAchieverModalOpen(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> Add Achiever
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="p-4 font-medium">Order</th>
                    <th className="p-4 font-medium">Achiever</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Achievement</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredAchievers.map((ach, idx) => (
                    <tr key={ach.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="p-4">
                        <div className="flex flex-col items-center gap-1 w-6">
                          <button onClick={() => moveItem('achievers', achievers.findIndex(a => a.id === ach.id), 'up')} disabled={isFilterActive || idx === 0 || ach.is_pinned !== filteredAchievers[idx-1]?.is_pinned} className="text-slate-400 hover:text-amber-500 disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                          <span className="text-xs font-mono">{ach.display_order}</span>
                          <button onClick={() => moveItem('achievers', achievers.findIndex(a => a.id === ach.id), 'down')} disabled={isFilterActive || idx === filteredAchievers.length - 1 || ach.is_pinned !== filteredAchievers[idx+1]?.is_pinned} className="text-slate-400 hover:text-amber-500 disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {ach.profile_photo ? (
                            <img src={ach.profile_photo} alt={ach.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ach.name)}&background=random`; }} />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold">{ach.name}</p>
                            <p className="text-xs text-slate-500">{ach.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex px-2 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-xs font-medium border border-amber-200 dark:border-amber-500/20">
                          {ach.library_achiever_categories?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{ach.achievement_title}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{ach.description}</p>
                      </td>
                      <td className="p-4">
                        {ach.is_active ? 
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /></span> :
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"><XCircle className="w-3.5 h-3.5" /></span>
                        }
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => { setEditingAchiever(ach); setSelectedFile(null); setIsAchieverModalOpen(true); }} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button 
                          onClick={() => setDeleteConfirm({ type: 'achiever', id: ach.id, name: ach.name })} 
                          disabled={deletingId === ach.id}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-40"
                          title="Delete Achiever"
                        >
                          {deletingId === ach.id ? <span className="text-xs font-bold text-rose-500">...</span> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAchievers.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">No achievers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingCategory.id ? "Edit Category" : "New Category"}
              </h2>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category Name</label>
                <input 
                  type="text" required
                  value={editingCategory.name} 
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea 
                  rows={3}
                  value={editingCategory.description || ''} 
                  onChange={e => setEditingCategory({...editingCategory, description: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white resize-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="cat_active"
                  checked={editingCategory.is_active} 
                  onChange={e => setEditingCategory({...editingCategory, is_active: e.target.checked})}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                />
                <label htmlFor="cat_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active (visible to public)</label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Achiever Modal */}
      {isAchieverModalOpen && editingAchiever && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl my-8 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingAchiever.id ? "Edit Achiever" : "Add Achiever"}
              </h2>
              <button onClick={() => { setIsAchieverModalOpen(false); setSelectedFile(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveAchiever} className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input 
                      type="text" required
                      value={editingAchiever.name} 
                      onChange={e => setEditingAchiever({...editingAchiever, name: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class / Designation</label>
                    <input 
                      type="text" required placeholder="e.g. Class 7C or Library Assistant"
                      value={editingAchiever.designation} 
                      onChange={e => setEditingAchiever({...editingAchiever, designation: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select
                      required
                      value={editingAchiever.category_id || ''}
                      onChange={e => setEditingAchiever({...editingAchiever, category_id: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                    >
                      <option value="" disabled>Select a category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="w-full sm:w-48 flex flex-col items-center justify-start gap-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 w-full">Profile Photo</label>
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center group">
                    {editingAchiever.profile_photo ? (
                      <img src={editingAchiever.profile_photo} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(editingAchiever.name || "A")}&background=random`; }} />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs">No Photo</span>
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                      <span className="text-sm font-medium">{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Achievement Title</label>
                  <input 
                    type="text" required placeholder="e.g. Reader of the Month"
                    value={editingAchiever.achievement_title} 
                    onChange={e => setEditingAchiever({...editingAchiever, achievement_title: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea 
                    rows={3} placeholder="Short description of the achievement..."
                    value={editingAchiever.description || ''} 
                    onChange={e => setEditingAchiever({...editingAchiever, description: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white resize-none"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Achievement Date</label>
                    <input 
                      type="date" 
                      value={editingAchiever.achievement_date || ''} 
                      onChange={e => setEditingAchiever({...editingAchiever, achievement_date: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                    <input 
                      type="text" placeholder="e.g. 2026-27"
                      value={editingAchiever.academic_year || ''} 
                      onChange={e => setEditingAchiever({...editingAchiever, academic_year: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="ach_active"
                    checked={editingAchiever.is_active} 
                    onChange={e => setEditingAchiever({...editingAchiever, is_active: e.target.checked})}
                    className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
                  />
                  <label htmlFor="ach_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active (visible to public)</label>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 mt-auto">
                <button type="button" onClick={() => { setIsAchieverModalOpen(false); setSelectedFile(null); }} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" disabled={uploadingImage} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 transition-colors flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Achiever
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-500" />
                Confirm Deletion
              </h3>
              <button 
                onClick={() => !deletingId && setDeleteConfirm(null)}
                disabled={!!deletingId}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-300">
              {deleteConfirm.type === 'category' ? (
                <div className="space-y-2">
                  <p>
                    Are you sure you want to delete category <span className="font-semibold text-slate-900 dark:text-white">"{deleteConfirm.name}"</span>?
                  </p>
                  <p className="text-rose-500 text-xs font-medium bg-rose-50 dark:bg-rose-500/10 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/20">
                    Warning: All achievers assigned to this category will also be permanently deleted.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p>
                    Are you sure you want to delete achiever <span className="font-semibold text-slate-900 dark:text-white">"{deleteConfirm.name}"</span>?
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    This action cannot be undone and will clean up profile photos.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button 
                type="button" 
                disabled={!!deletingId}
                onClick={() => setDeleteConfirm(null)} 
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                type="button" 
                disabled={!!deletingId}
                onClick={() => {
                  if (deleteConfirm.type === 'category') {
                    executeDeleteCategory(deleteConfirm.id);
                  } else {
                    executeDeleteAchiever(deleteConfirm.id);
                  }
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {deletingId ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete {deleteConfirm.type === 'category' ? 'Category' : 'Achiever'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
