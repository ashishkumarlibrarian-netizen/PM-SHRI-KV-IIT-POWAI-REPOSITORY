import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Loader2, ArrowLeft, Heart, Eye, Share2, Pin, Calendar, User, LayoutGrid, FileText, Download, PlayCircle, Image as ImageIcon, Maximize2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, X, Youtube, ExternalLink, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function LibraryShowcaseTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [isLiking, setIsLiking] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category)))];

  const getUserIds = () => {
    let user_id = null;
    let visitor_hash = localStorage.getItem("library_visitor_id");

    try {
      const savedUserStr = localStorage.getItem("kv_library_user");
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u.id || u.user_id) {
          user_id = u.id || u.user_id;
        }
      }
    } catch (e) {}

    if (!visitor_hash) {
      visitor_hash = "visitor_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("library_visitor_id", visitor_hash);
    }
    return { user_id, visitor_hash };
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedPost && selectedPost.id) {
      const { user_id, visitor_hash } = getUserIds();
      handleView(selectedPost, visitor_hash); // keeping identifier for handleView as it's a different endpoint
      checkLikedStatus(selectedPost.id, user_id, visitor_hash);
      fetchGalleryImages(selectedPost.id);
    } else {
      setGalleryImages([]);
      setLightboxIndex(null);
      setUserLiked(false);
    }
  }, [selectedPost?.id]);

  const checkLikedStatus = async (postId: string, user_id: string | null, visitor_hash: string) => {
    try {
      const params = new URLSearchParams();
      if (user_id) params.append('user_id', user_id);
      if (visitor_hash) params.append('visitor_hash', visitor_hash);

      const res = await fetch(`/api/library-showcase/${postId}/liked-status?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUserLiked(data.liked);
        if (typeof data.likes === 'number') {
          setSelectedPost(prev => prev && prev.id === postId ? { ...prev, likes: data.likes } : prev);
          setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
        }
      }
    } catch (e) {
      console.error("Failed to check liked status:", e);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || galleryImages.length === 0) return;
      if (e.key === "Escape") {
        setLightboxIndex(null);
        setIsZoomed(false);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex(prev => (prev === null || prev === 0 ? galleryImages.length - 1 : prev - 1));
        setIsZoomed(false);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex(prev => (prev === null || prev >= galleryImages.length - 1 ? 0 : prev + 1));
        setIsZoomed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, galleryImages.length]);

  const fetchGalleryImages = async (postId: string) => {
    try {
      const res = await fetch(`/api/library-showcase/${postId}/images`);
      if (res.ok) {
        const data = await res.json();
        setGalleryImages(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch gallery images:", e);
    }
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/library-showcase");
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data.filter((p: any) => p.is_active));
        setErrorMsg(null);
      } else {
        console.error("API Error:", data);
        setErrorMsg(`Failed to fetch posts: ${data.message || data.details || JSON.stringify(data)}`);
        setPosts([]);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(`Error fetching posts: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (post: any) => {
    if (!post || !post.id || isLiking) return;
    setIsLiking(true);

    let user_id = null;
    let visitor_hash = localStorage.getItem("library_visitor_id");

    try {
      const savedUserStr = localStorage.getItem("kv_library_user");
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u.id || u.user_id) {
          user_id = u.id || u.user_id;
        }
      }
    } catch (e) {}

    if (!visitor_hash) {
      visitor_hash = "visitor_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();
      localStorage.setItem("library_visitor_id", visitor_hash);
    }

    try {
      const res = await fetch(`/api/library-showcase/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, visitor_hash })
      });
      if (res.ok) {
        const data = await res.json();
        setUserLiked(data.liked);
        const newCount = typeof data.likes === 'number' ? data.likes : post.likes;
        setSelectedPost(prev => prev && prev.id === post.id ? { ...prev, likes: newCount } : prev);
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newCount } : p));
      }
    } catch (e) {
      console.error("Error toggling like:", e);
    } finally {
      setIsLiking(false);
    }
  };

  const handleView = async (post: any, visitorId: string) => {
    try {
      const res = await fetch(`/api/library-showcase/${post.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: visitorId })
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, views: data.views } : p));
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost(prev => prev ? { ...prev, views: data.views } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openPost = (post: any) => {
    setSelectedPost(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredPosts = posts.filter(p => {
    if (selectedCategory !== "All" && p.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && 
          !p.author?.toLowerCase().includes(q) && 
          !p.description?.toLowerCase().includes(q) &&
          !(p.tags || []).some((t: string) => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const getYoutubeEmbed = (url: string) => {
    if (!url) return null;
    try {
      const cleaned = url.trim();
      if (cleaned.includes("youtu.be/")) {
        const id = cleaned.split("youtu.be/")[1]?.split(/[?#]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (cleaned.includes("youtube.com/embed/")) {
        const id = cleaned.split("youtube.com/embed/")[1]?.split(/[?#]/)[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (cleaned.includes("v=")) {
        const params = new URLSearchParams(cleaned.split("?")[1] || "");
        const id = params.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      const match = cleaned.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
      return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    } catch (e) {
      console.error("Error parsing YouTube URL:", e);
      return null;
    }
  };

  const resolveMediaUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/library-showcase/${url.replace(/^\//, '')}`;
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString();
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-slate-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
          {errorMsg}
        </div>
      )}
      {!selectedPost ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder="Search showcase..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={post.id}
                onClick={() => openPost(post)}
                className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {post.image_url ? (
                    <img src={resolveMediaUrl(post.image_url) || undefined} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LayoutGrid className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    </div>
                  )}
                  {post.featured && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1">
                      <Pin className="w-3 h-3" /> Featured
                    </div>
                  )}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-semibold rounded-lg shadow-lg">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
                    {post.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <User className="w-4 h-4" /> {post.author}
                  </div>
                  
                  <div className="flex-grow"></div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {post.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {post.likes || 0}</span>
                    </div>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-20 text-slate-500 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <LayoutGrid className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No showcase posts found</h3>
              <p>Try selecting a different category or adjusting your search.</p>
            </div>
          )}
          
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="relative">
            <div className="h-64 md:h-96 w-full relative bg-slate-100 dark:bg-slate-800">
              {selectedPost.image_url ? (
                <img src={resolveMediaUrl(selectedPost.image_url) || undefined} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
                  <LayoutGrid className="w-16 h-16 text-slate-400 dark:text-slate-600" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
            
            <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 p-2 rounded-xl backdrop-blur-md transition-colors bg-black/30 hover:bg-black/50 text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="p-8 md:p-12 absolute bottom-0 left-0 right-0 text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white">
                  {selectedPost.category}
                </span>
                {selectedPost.featured && (
                  <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 bg-amber-500/80 backdrop-blur-md text-white">
                    <Pin className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-sm">
                {selectedPost.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-white/80">
                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedPost.author}</span>
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(selectedPost.created_at)}</span>
                <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedPost.views || 0} Views</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="flex-grow space-y-8">
                {/* Content */}
                <div className="prose prose-slate dark:prose-invert max-w-none prose-img:rounded-2xl prose-headings:font-bold prose-a:text-amber-500">
                  <div dangerouslySetInnerHTML={{ __html: selectedPost.content }} />
                </div>

                {/* Gallery Section */}
                {galleryImages && galleryImages.length > 0 && (
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-amber-500" /> Gallery
                      </h3>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                        {galleryImages.length} {galleryImages.length === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {galleryImages.map((img, idx) => (
                        <div 
                          key={img.id || idx}
                          onClick={() => { setLightboxIndex(idx); setIsZoomed(false); }}
                          className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm hover:shadow-md transition-all"
                        >
                          <img 
                            src={resolveMediaUrl(img.image_url) || ''} 
                            alt={`Gallery image ${idx + 1}`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                  {/* Embedded Video / MP4 Video */}
                  {selectedPost.video_url && (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-black flex items-center justify-center">
                      <video 
                        src={resolveMediaUrl(selectedPost.video_url) || undefined} 
                        controls 
                        className="w-full h-full object-contain"
                        autoPlay={false}
                        preload="metadata"
                        poster={selectedPost.image_url ? resolveMediaUrl(selectedPost.image_url) || undefined : undefined}
                      />
                    </div>
                  )}
               </div>
               
               <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
                 {/* Professional Action Panel */}
                 <div className="bg-slate-50/80 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm space-y-3">
                   <h4 className="font-bold text-slate-800 dark:text-white mb-2 text-xs uppercase tracking-wider opacity-80">
                     Actions & Interaction
                   </h4>

                   {/* Like Button */}
                   <button 
                     onClick={() => handleLike(selectedPost)} 
                     disabled={isLiking}
                     className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group text-left ${
                       userLiked 
                         ? 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-sm' 
                         : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:border-rose-500/50 hover:shadow-lg hover:-translate-y-0.5'
                     }`}
                   >
                     <div className="flex items-center gap-3">
                       <div className={`p-2.5 rounded-lg transition-colors ${userLiked ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-rose-500 group-hover:text-white'}`}>
                         <Heart className={`w-5 h-5 ${userLiked ? 'fill-current' : ''}`} />
                       </div>
                       <div>
                         <div className="font-bold text-sm leading-tight">{userLiked ? 'Liked' : 'Like Post'}</div>
                         <div className="text-xs text-slate-500 dark:text-slate-400">{selectedPost.likes || 0} Appreciation{selectedPost.likes === 1 ? '' : 's'}</div>
                       </div>
                     </div>
                     <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${userLiked ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                       {userLiked ? 'Liked' : '+1'}
                     </span>
                   </button>

                   {/* Share Button */}
                   <button 
                     onClick={() => {
                       navigator.clipboard.writeText(window.location.href);
                       setCopiedToast(true);
                       setTimeout(() => setCopiedToast(false), 2500);
                     }} 
                     className="w-full p-4 rounded-xl border bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 hover:border-amber-500/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group text-left"
                   >
                     <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                         {copiedToast ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
                       </div>
                       <div>
                         <div className="font-bold text-sm leading-tight">{copiedToast ? 'Link Copied!' : 'Share Post'}</div>
                         <div className="text-xs text-slate-500 dark:text-slate-400">{copiedToast ? 'Copied to clipboard' : 'Copy link to share'}</div>
                       </div>
                     </div>
                     <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition-colors" />
                   </button>

                   {/* Watch Related Video Button (Dark Glassmorphism Card) */}
                   {selectedPost.youtube_url && (
                     <a 
                       href={selectedPost.youtube_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="w-full p-4 rounded-xl border bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-slate-700/80 text-white hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between group text-left block"
                     >
                       <div className="flex items-center gap-3">
                         <div className="p-2.5 rounded-lg bg-red-600/90 text-white group-hover:bg-red-600 transition-colors shadow-sm">
                           <Youtube className="w-5 h-5" />
                         </div>
                         <div>
                           <div className="font-bold text-sm leading-tight text-white">Watch Related Video</div>
                           <div className="text-xs text-slate-400">Opens on YouTube</div>
                         </div>
                       </div>
                       <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                     </a>
                   )}
                 </div>
                
                {/* Tags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-4">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag: string) => (
                        <span key={tag} className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {lightboxIndex !== null && galleryImages[lightboxIndex] && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8"
            onClick={() => { setLightboxIndex(null); setIsZoomed(false); }}
          >
            {/* Top Controls Bar */}
            <div className="flex items-center justify-between text-white z-10" onClick={e => e.stopPropagation()}>
              <div className="text-sm font-semibold opacity-80">
                Photo {lightboxIndex + 1} of {galleryImages.length}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)} 
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title={isZoomed ? "Zoom Out" : "Zoom In"}
                >
                  {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
                </button>

                <a 
                  href={resolveMediaUrl(galleryImages[lightboxIndex].image_url) || '#'}
                  download={`gallery-image-${lightboxIndex + 1}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
                  title="Download Image"
                  onClick={e => e.stopPropagation()}
                >
                  <Download className="w-5 h-5" />
                </a>

                <button 
                  type="button"
                  onClick={() => { setLightboxIndex(null); setIsZoomed(false); }}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image View Area */}
            <div 
              className="relative flex-grow flex items-center justify-center overflow-hidden my-4 select-none"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={resolveMediaUrl(galleryImages[lightboxIndex].image_url) || ''} 
                alt={`Gallery image ${lightboxIndex + 1}`} 
                className={`max-h-full max-w-full object-contain rounded-xl transition-transform duration-300 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {galleryImages.length > 1 && (
                <button 
                  type="button"
                  onClick={() => {
                    setLightboxIndex(lightboxIndex === 0 ? galleryImages.length - 1 : lightboxIndex - 1);
                    setIsZoomed(false);
                  }}
                  className="absolute left-2 md:left-6 p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/10 shadow-xl"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {galleryImages.length > 1 && (
                <button 
                  type="button"
                  onClick={() => {
                    setLightboxIndex(lightboxIndex === galleryImages.length - 1 ? 0 : lightboxIndex + 1);
                    setIsZoomed(false);
                  }}
                  className="absolute right-2 md:right-6 p-3 rounded-2xl bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/10 shadow-xl"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Thumbnail Strip */}
            {galleryImages.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10" onClick={e => e.stopPropagation()}>
                {galleryImages.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => { setLightboxIndex(idx); setIsZoomed(false); }}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      lightboxIndex === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={resolveMediaUrl(img.image_url) || ''} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
