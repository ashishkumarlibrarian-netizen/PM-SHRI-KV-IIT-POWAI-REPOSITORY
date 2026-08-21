import React, { useState, useEffect } from "react";
import { Award, Search, Filter, Calendar, BookOpen, Star, Trophy, Pin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LibraryAchieversTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [achievers, setAchievers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, achRes] = await Promise.all([
        fetch('/api/library-achievers/categories', { cache: 'no-store' }),
        fetch('/api/library-achievers', { cache: 'no-store' })
      ]);
      
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setCategories(cats.filter((c: any) => c.is_active));
      }
      if (achRes.ok) {
        const ach = await achRes.json();
        setAchievers(ach.filter((a: any) => a.is_active));
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  const filteredAchievers = achievers.filter(a => {
    const matchesSearch = (a.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (a.achievement_title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (a.designation?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                          (a.library_achiever_categories?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || a.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const achieversByCategory = categories.map(cat => ({
    ...cat,
    achievers: filteredAchievers.filter(a => a.category_id === cat.id)
  })).filter(cat => cat.achievers.length > 0);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 rotate-3">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Library Achievers
          </h1>
          <p className="text-lg text-slate-300 font-medium">
            Celebrating readers, contributors and library champions who inspire our learning community.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, class, or achievement..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white shadow-sm font-medium"
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full pl-12 pr-8 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white appearance-none shadow-sm font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Achievers Grid */}
      <div className="space-y-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
            <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="font-medium">Loading achievers...</p>
          </div>
        ) : achieversByCategory.length > 0 ? (
          achieversByCategory.map(category => (
            <div key={category.id} className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight uppercase flex items-center gap-2">
                  {category.is_pinned && <Pin className="w-5 h-5 text-amber-500 fill-amber-500/20" />}
                  {category.name}
                </h2>
                <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {category.achievers.map((achiever: any) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={achiever.id} 
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col items-center text-center space-y-4"
                  >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                    
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 shadow-inner flex items-center justify-center text-slate-400">
                      {achiever.profile_photo ? (
                        <img src={achiever.profile_photo} alt={achiever.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(achiever.name)}&background=random`; }} />
                      ) : (
                        <Trophy className="w-10 h-10 opacity-50" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center justify-center gap-1.5">
                        {achiever.is_pinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500/20" />}
                        {achiever.name}
                      </h3>
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">{achiever.designation}</p>
                    </div>
                    
                    <div className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="text-sm">{achiever.achievement_title}</span>
                      </div>
                      {achiever.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          "{achiever.description}"
                        </p>
                      )}
                    </div>
                    
                    {(achiever.academic_year || achiever.achievement_date) && (
                      <div className="w-full flex items-center justify-center gap-3 text-xs text-slate-400 font-medium pt-2 border-t border-slate-100 dark:border-slate-800/50">
                        {achiever.academic_year && (
                          <div className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {achiever.academic_year}</div>
                        )}
                        {achiever.achievement_date && (
                          <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(achiever.achievement_date).toLocaleDateString()}</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            <Trophy className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              {categories.length === 0 ? "No categories yet" : "No achievers found"}
            </h3>
            <p className="text-slate-500">
              {categories.length === 0 
                ? "No Library Achievers categories have been added yet."
                : "No achievers have been added to this category yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
