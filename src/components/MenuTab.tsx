import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  ExternalLink, 
  Globe, 
  GraduationCap, 
  Library, 
  School,
  FileText,
  Video,
  Database,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  Star,
  Bookmark,
  Briefcase
} from "lucide-react";

export default function MenuTab() {
  const [dbLinks, setDbLinks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/quick_links')
      .then(r => {
        if (!r.ok) throw new Error("Failed to fetch links");
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setDbLinks(data);
        } else {
          setDbLinks([]);
        }
        setLoading(false);
      })
      .catch(e => {
        console.error("Error loading quick links:", e);
        setError("Could not load links. Please try again.");
        setLoading(false);
      });
  }, []);

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'School': return <School className="w-5 h-5" />;
      case 'Library': return <Library className="w-5 h-5" />;
      case 'FileText': return <FileText className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      case 'Video': return <Video className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Star': return <Star className="w-5 h-5" />;
      case 'Bookmark': return <Bookmark className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  const filteredLinks = dbLinks.filter(l => {
    if (!l.is_active) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    
    return (
      (l.title || "").toLowerCase().includes(q) ||
      (l.category || "").toLowerCase().includes(q) ||
      (l.description || "").toLowerCase().includes(q) ||
      (l.url || "").toLowerCase().includes(q)
    );
  });

  // Group links by category
  const categoryMap = new Map<string, any[]>();
  filteredLinks.forEach(dl => {
    const catName = dl.category || "General Resources";
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, []);
    }
    categoryMap.get(catName)!.push({
      id: dl.id,
      title: dl.title,
      url: dl.url,
      iconName: dl.icon || "Globe",
      icon: getIconComponent(dl.icon),
      description: dl.description || "",
      badge: dl.badge || "",
      open_new_tab: dl.open_new_tab !== false,
      order: dl.display_order || 0
    });
  });

  const finalCategories: { title: string; links: any[] }[] = [];
  categoryMap.forEach((links, title) => {
    links.sort((a, b) => a.order - b.order);
    finalCategories.push({ title, links });
  });

  // Sort categories alphabetically
  finalCategories.sort((a, b) => a.title.localeCompare(b.title));

  const toggleCategory = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedCategories(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const getBadgeStyles = (badge: string) => {
    const b = badge.toUpperCase().trim();
    if (b === "NEW") {
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50";
    }
    if (b === "UPDATED" || b === "LIVE") {
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50";
    }
    if (b === "RECOMMENDED" || b === "IMPORTANT") {
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50";
    }
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto py-8 px-4"
    >
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-xl">
          <School className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Useful Resources
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
          Explore quick-access study materials, official portals, libraries, and external tools curated for you.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-10 max-w-lg mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search resources by title, category, badge or URL..."
          className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/85 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm text-slate-800 dark:text-slate-100 shadow-sm backdrop-blur-md transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Loading useful links...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 p-6 bg-rose-50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/40 rounded-2xl">
          <p className="text-rose-600 dark:text-rose-400 font-medium mb-1">Failed to fetch links</p>
          <p className="text-slate-500 dark:text-slate-400 text-xs">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {finalCategories.map((category) => {
            const isCollapsed = collapsedCategories[category.title];
            const activeLinksCount = category.links.length;

            return (
              <motion.div
                key={category.title}
                layout="position"
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden shadow-md"
              >
                {/* Category Header Card */}
                <div 
                  onClick={(e) => toggleCategory(category.title, e)}
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors select-none border-b border-slate-100 dark:border-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                      {category.title}
                    </h3>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                      {activeLinksCount} {activeLinksCount === 1 ? 'link' : 'links'}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => toggleCategory(category.title, e)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                  >
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>

                {/* Category Links List */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="p-5 space-y-3 bg-slate-50/20 dark:bg-slate-900/10">
                        {category.links.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target={link.open_new_tab ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="flex items-start p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-xl transition-all group shadow-sm hover:shadow-md"
                          >
                            <div className="w-11 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-all duration-300 mr-4 border border-slate-200/60 dark:border-slate-700/60 flex-shrink-0">
                              {link.icon}
                            </div>
                            <div className="flex-grow min-w-0 pr-2">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-sm leading-tight">
                                  {link.title}
                                </span>
                                {link.badge && (
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getBadgeStyles(link.badge)}`}>
                                    {link.badge}
                                  </span>
                                )}
                              </div>
                              {link.description && (
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">
                                  {link.description}
                                </p>
                              )}
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate mt-1 max-w-sm">
                                {link.url}
                              </span>
                            </div>
                            <div className="flex-shrink-0 pt-1">
                              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 opacity-40 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {finalCategories.length === 0 && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 font-medium bg-white/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              No matching resources found for "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
