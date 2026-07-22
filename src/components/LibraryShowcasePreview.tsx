import React, { useState, useEffect } from "react";
import { ArrowRight, Calendar, Pin, Eye, Heart } from "lucide-react";
import { motion } from "motion/react";

export default function LibraryShowcasePreview({ onNavigate }: { onNavigate: () => void }) {
  const [posts, setPosts] = useState<any[]>([]);

  const resolveMediaUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/library-showcase/${url.replace(/^\//, '')}`;
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString();
  };


  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/library-showcase");
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Failed to fetch showcase preview:", data);
        return;
      }
      const activePosts = data.filter((p: any) => p.is_active);
      
      // Sort: Featured first, then by date. Latest 5
      const featured = activePosts.filter((p: any) => p.featured);
      const regular = activePosts.filter((p: any) => !p.featured);
      
      const combined = [...featured, ...regular].slice(0, 5);
      setPosts(combined);
    } catch (e) {
      console.error(e);
    }
  };

  if (posts.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          Latest in Library Showcase
        </h3>
        <button 
          onClick={onNavigate}
          className="text-amber-500 hover:text-amber-600 text-sm font-bold flex items-center gap-1 group transition-colors"
        >
          View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {posts.map((post, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={post.id}
            onClick={onNavigate}
            className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col ${idx === 0 ? 'lg:col-span-2' : 'lg:col-span-1'}`}
          >
            <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${idx === 0 ? 'h-48' : 'h-32'}`}>
              {post.image_url ? (
                <img src={resolveMediaUrl(post.image_url) || undefined} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700">
                  <span className="text-[10px] font-semibold text-slate-400">No Cover Image</span>
                </div>
              )}
              {post.featured && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow flex items-center gap-1">
                  <Pin className="w-3 h-3" /> Featured
                </div>
              )}
            </div>
            
            <div className="p-4 flex flex-col flex-grow">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">{post.category}</span>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-2 group-hover:text-amber-500 transition-colors mb-2">
                {post.title}
              </h4>
              
              <div className="mt-auto flex flex-col gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span className="truncate max-w-[60%]">By {post.author || 'Unknown'}</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {post.likes || 0}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
