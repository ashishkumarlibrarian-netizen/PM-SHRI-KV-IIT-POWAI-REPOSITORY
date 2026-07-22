import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, Pin, Check, X, Loader2, Save, Image as ImageIcon, Link as LinkIcon, Video, FileText, UploadCloud, RefreshCw, ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { uploadFile } from "../lib/upload";
import RichTextEditor from "./RichTextEditor";

export default function LibraryShowcaseManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [deletingPost, setDeletingPost] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const categories = [
    "📚 Book Review", "🎨 Art & Craft", "📝 Creative Writing", "🎤 Poem Recitation",
    "🎭 Drama", "🎙 Speech", "🏆 Competition", "📖 Reading Activity", "📸 Library Event",
    "🌱 Awareness Campaign", "🎉 Celebration", "🧪 Exhibition", "💡 Innovation",
    "🏅 Achievement", "📹 Video Showcase", "📷 Photo Gallery", "⭐ Featured"
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/library-showcase");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("Failed to fetch showcase posts:", data);
        alert(`Failed to fetch posts: ${data.message || data.details || JSON.stringify(data)}`);
        setPosts([]);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error fetching posts: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost({
      title: "",
      description: "",
      content: "",
      category: "📚 Book Review",
      author: "",
      image_url: "",
      video_url: "",
      youtube_url: "",
      tags: [],
      featured: false,
      is_active: true,
      display_order: 0
    });
    setGalleryImages([]);
  };

  const handleEdit = async (post: any) => {
    setEditingPost({
      id: post.id,
      title: post.title || "",
      description: post.description || "",
      content: post.content || "",
      category: post.category || "📚 Book Review",
      author: post.author || "",
      image_url: post.image_url || "",
      video_url: post.video_url || "",
      youtube_url: post.youtube_url || "",
      tags: post.tags || [],
      featured: post.featured || false,
      is_active: post.is_active !== false,
      display_order: post.display_order || 0
    });
    setGalleryImages([]);
    if (post.id) {
      try {
        const res = await fetch(`/api/library-showcase/${post.id}/images`);
        if (res.ok) {
          const data = await res.json();
          setGalleryImages(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to fetch gallery images:", e);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const method = editingPost.id ? 'PUT' : 'POST';
      const url = editingPost.id ? `/api/admin/library-showcase/${editingPost.id}` : `/api/admin/library-showcase`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPost)
      });
      
      if (res.ok) {
        const savedPost = await res.json();
        const savedPostId = savedPost?.id || editingPost.id;

        if (savedPostId) {
          const imagesPayload = galleryImages.map((img, idx) => ({
            image_url: img.image_url,
            display_order: idx
          }));
          await fetch(`/api/admin/library-showcase/${savedPostId}/images`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: imagesPayload })
          });
        }

        setEditingPost(null);
        setGalleryImages([]);
        showToast("Post saved successfully!");
        await fetchPosts();
      } else {
        const errorData = await res.json();
        alert(`Failed to save post: ${errorData.message || errorData.details || JSON.stringify(errorData)}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error saving post: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadGalleryFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    const newImages = [...galleryImages];
    const postId = editingPost?.id || 'new';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split('.').pop() || 'png';
        const fileName = `${postId}/gallery/${Math.random().toString(36).substring(7)}_${Date.now()}.${ext}`;
        const url = await uploadFile(file, 'library-showcase', fileName);
        newImages.push({
          image_url: url,
          display_order: newImages.length
        });
      }
      setGalleryImages(newImages);
    } catch (err: any) {
      console.error(err);
      alert(`Gallery upload failed: ${err.message}`);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleGalleryFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadGalleryFiles(e.target.files);
    }
  };

  const handleGalleryDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadGalleryFiles(e.dataTransfer.files);
    }
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= galleryImages.length) return;
    const updated = [...galleryImages];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setGalleryImages(updated);
  };

  const replaceGalleryImage = async (index: number, file: File) => {
    setIsUploadingGallery(true);
    try {
      const postId = editingPost?.id || 'new';
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `${postId}/gallery/${Math.random().toString(36).substring(7)}_${Date.now()}.${ext}`;
      const url = await uploadFile(file, 'library-showcase', fileName);
      setGalleryImages(prev => {
        const next = [...prev];
        next[index] = { ...next[index], image_url: url };
        return next;
      });
    } catch (err: any) {
      alert(`Failed to replace image: ${err.message}`);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const confirmDeletePost = async () => {
    if (!deletingPost) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/library-showcase/${deletingPost.id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Post and all associated media deleted successfully!");
        if (editingPost?.id === deletingPost.id) {
          setEditingPost(null);
          setGalleryImages([]);
        }
        setDeletingPost(null);
        await fetchPosts();
      } else {
        const errorData = await res.json();
        alert(`Failed to delete post: ${errorData.message || errorData.details || JSON.stringify(errorData)}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Error deleting post: ${e.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (post: any) => {
    try {
      const res = await fetch(`/api/admin/library-showcase/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !post.is_active })
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to update status: ${errorData.message || errorData.details || JSON.stringify(errorData)}`);
      }
      fetchPosts();
    } catch (e: any) {
      console.error(e);
      alert(`Error updating status: ${e.message}`);
    }
  };

  const handleTogglePin = async (post: any) => {
    try {
      const res = await fetch(`/api/admin/library-showcase/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !post.featured })
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Failed to update pin: ${errorData.message || errorData.details || JSON.stringify(errorData)}`);
      }
      fetchPosts();
    } catch (e: any) {
      console.error(e);
      alert(`Error updating pin: ${e.message}`);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Auto-generate a name for new files
    const ext = file.name.split('.').pop() || 'png';
    const folder = field === 'image_url' ? 'images' : 'videos';
    const fileName = `${folder}/${Math.random().toString(36).substring(7)}_${Date.now()}.${ext}`;

    try {
      const url = await uploadFile(file, 'library-showcase', fileName);
      setEditingPost({ ...editingPost, [field]: url });
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message}`);
    }
  };



  const resolveMediaUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/library-showcase/${url.replace(/^\//, '')}`;
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;

  const stats = {
    totalPosts: posts.length,
    totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
    totalLikes: posts.reduce((sum, p) => sum + (p.likes || 0), 0),
    mostViewed: [...posts].sort((a, b) => (b.views || 0) - (a.views || 0))[0]?.title || 'N/A'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Library Showcase Manager</h2>
        {!editingPost && (
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add New Post
          </button>
        )}
      </div>
      
      {!editingPost && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Posts</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalPosts}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Views</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalViews}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Likes</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalLikes}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Most Viewed</p>
            <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-2">{stats.mostViewed}</p>
          </div>
        </div>
      )}

      {editingPost ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{editingPost.id ? 'Edit Post' : 'Create New Post'}</h3>
            <button onClick={() => setEditingPost(null)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
              <input value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Post Title" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category</label>
              <select value={editingPost.category} onChange={e => setEditingPost({...editingPost, category: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Tags (comma separated)</label>
              <input value={(editingPost.tags || []).join(', ')} onChange={e => setEditingPost({...editingPost, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Science, Art, Event" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Author Name</label>
              <input value={editingPost.author || ''} onChange={e => setEditingPost({...editingPost, author: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Student or Teacher Name" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Description (Short Summary)</label>
              <input value={editingPost.description || ''} onChange={e => setEditingPost({...editingPost, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" placeholder="Short description of the post" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-2">Cover Image</label>
              <div className="flex items-center gap-4">
                {editingPost.image_url && (
                  <img src={resolveMediaUrl(editingPost.image_url) || undefined} alt="" className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                )}
                <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {editingPost.image_url ? 'Change Image' : 'Upload Image'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, 'image_url')} />
                </label>
              </div>
            </div>

            {/* Gallery Images Section */}
            <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Gallery Images
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload multiple photos to create an interactive gallery inside this post.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {galleryImages.length} {galleryImages.length === 1 ? 'image' : 'images'}
                </span>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleGalleryDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                  isDraggingOver 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  {isUploadingGallery ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                  )}
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isUploadingGallery ? 'Uploading gallery photos...' : 'Drag & drop gallery images here, or browse files'}
                  </div>
                  <p className="text-xs text-slate-400">Supports PNG, JPG, WEBP, GIF (Unlimited photos)</p>
                  <label className="mt-2 cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Select Gallery Images
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleGalleryFileInput} 
                      disabled={isUploadingGallery}
                    />
                  </label>
                </div>
              </div>

              {/* Preview Thumbnails Grid */}
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-2">
                  {galleryImages.map((img, idx) => (
                    <div 
                      key={img.id || img.image_url || idx}
                      className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square shadow-sm"
                    >
                      <img 
                        src={resolveMediaUrl(img.image_url) || ''} 
                        alt={`Gallery ${idx + 1}`} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white bg-black/60 px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                          <button 
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow"
                            title="Delete image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-1.5 bg-black/40 p-1 rounded-lg backdrop-blur-sm">
                          <button 
                            type="button"
                            onClick={() => moveGalleryImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 bg-white/20 text-white rounded hover:bg-white/40 disabled:opacity-30 transition-colors"
                            title="Move left/earlier"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </button>
                          <label 
                            className="p-1 bg-white/20 text-white rounded hover:bg-white/40 cursor-pointer transition-colors"
                            title="Replace image"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  replaceGalleryImage(idx, e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          <button 
                            type="button"
                            onClick={() => moveGalleryImage(idx, 'down')}
                            disabled={idx === galleryImages.length - 1}
                            className="p-1 bg-white/20 text-white rounded hover:bg-white/40 disabled:opacity-30 transition-colors"
                            title="Move right/later"
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-500 mb-1">Content</label>
              <RichTextEditor value={editingPost.content || ''} onChange={(val: string) => setEditingPost({...editingPost, content: val})} className="h-96" />
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
               <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Video (Optional)</label>
                  <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                    <Video className="w-4 h-4" /> {editingPost.video_url ? 'Change Video' : 'Upload MP4 Video'}
                    <input type="file" accept="video/mp4,video/webm" className="hidden" onChange={e => handleFileUpload(e, 'video_url')} />
                  </label>
                  {editingPost.video_url && <p className="text-xs text-green-600 mt-2 truncate">{editingPost.video_url}</p>}
               </div>
               
               <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">YouTube URL</label>
                  <input value={editingPost.youtube_url || ''} onChange={e => setEditingPost({...editingPost, youtube_url: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 mt-1" placeholder="https://youtube.com/watch?v=..." />
               </div>
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={editingPost.is_active || false} onChange={e => setEditingPost({...editingPost, is_active: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active (Visible)</span>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input type="checkbox" checked={editingPost.featured || false} onChange={e => setEditingPost({...editingPost, featured: e.target.checked})} className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Featured (Pinned)</span>
              </label>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Display Order</label>
                <input type="number" value={editingPost.display_order || 0} onChange={e => setEditingPost({...editingPost, display_order: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={() => setEditingPost(null)} className="px-6 py-2.5 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={isSaving || !editingPost.title} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Publish Post
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Post</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {post.image_url ? (
                        <img src={resolveMediaUrl(post.image_url) || undefined} alt="" className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{post.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{post.author}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium whitespace-nowrap">
                      {post.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {post.is_active ? 'Active' : 'Hidden'}
                      </span>
                      {post.featured && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-1">
                    <button onClick={() => handleTogglePin(post)} className={`p-2 rounded-lg transition-colors ${post.featured ? 'bg-amber-100 text-amber-700' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`} title={post.featured ? 'Unpin' : 'Pin'}>
                      <Pin className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleToggleActive(post)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg transition-colors" title={post.is_active ? 'Hide' : 'Unhide'}>
                      {post.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleEdit(post)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingPost(post)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No showcase posts yet. Create one!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Showcase Post</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deletingPost.title}"</strong>? 
              This will remove the post, cover image, video, and all gallery photos from storage and database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingPost(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeletePost}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
