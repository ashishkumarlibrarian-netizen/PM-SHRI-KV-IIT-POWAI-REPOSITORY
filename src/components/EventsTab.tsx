import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Image as ImageIcon, Video, Send, Loader2, Edit3, Plus, Trash2, Search, X, ChevronLeft, ChevronRight, UploadCloud } from "lucide-react";
import { User } from "../types";

interface LibraryEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  videoUrl: string | null;
  mediaUrls?: string[];
  timestamp: string;
}

interface EventsTabProps {
  currentUser: User | null;
}

export default function EventsTab({ currentUser }: EventsTabProps) {
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eventToDelete, setEventToDelete] = useState<LibraryEvent | null>(null);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [timestamp, setTimestamp] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<{eventId: string, index: number} | null>(null);
  const [viewingEvent, setViewingEvent] = useState<LibraryEvent | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = currentUser?.role === "admin";

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/events?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openForm = (event?: LibraryEvent) => {
    if (event) {
      setEditingId(event.id);
      setTitle(event.title);
      setDescription(event.description);
      setVideoUrl(event.videoUrl || "");
      setMediaUrls(event.mediaUrls || (event.imageUrl ? [event.imageUrl] : []));
      
      // Format date for datetime-local input
      const date = new Date(event.timestamp);
      // To keep local time
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset*60*1000));
      const formattedDate = localDate.toISOString().slice(0, 16);
      setTimestamp(formattedDate);
    } else {
      setEditingId(null);
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setMediaUrls([]);
      
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setTimestamp(now.toISOString().slice(0, 16));
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMediaUrls(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;
    const id = eventToDelete.id;
    setEventToDelete(null);
    setViewingEvent(null);
    
    try {
      const token = localStorage.getItem("kv_library_token");
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setEvents(prev => prev.filter(e => e.id !== id));
        fetchEvents();
      } else {
        const txt = await res.text();
        console.error("Delete failed:", txt);
        if (res.status === 401) {
          alert("Your session has expired. Please log out and log back in.");
          localStorage.removeItem("kv_library_token");
          localStorage.removeItem("kv_library_user");
          window.location.reload();
        } else {
          alert("Failed to delete event: " + txt);
        }
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while deleting the event.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("kv_library_token");
      const url = editingId ? `/api/events/${editingId}` : "/api/events";
      const method = editingId ? "PUT" : "POST";
      
      let validTimestamp = new Date().toISOString();
      if (timestamp) {
        const d = new Date(timestamp);
        if (!isNaN(d.getTime())) {
          validTimestamp = d.toISOString();
        }
      }
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          mediaUrls,
          videoUrl: videoUrl || null,
          timestamp: validTimestamp
        })
      });
      
      if (res.ok) {
        closeForm();
        fetchEvents();
      } else {
        const txt = await res.text();
        console.error("Submit failed:", txt);
        if (res.status === 401) {
          alert("Your session has expired. Please log out and log back in.");
          localStorage.removeItem("kv_library_token");
          localStorage.removeItem("kv_library_user");
          window.location.reload();
        } else {
          alert("Failed to save event: " + txt);
        }
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving the event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 relative">
      {/* Header section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col items-start space-y-4 max-w-2xl">
          <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-2xl flex items-center justify-center mb-2">
            <Calendar className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Library Events & Blog
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Stay updated with the latest happenings, workshops, and exhibitions at PM Shri KV IIT Powai Library.
          </p>
        </div>
        
        {isAdmin && (
          <div className="relative z-10">
            <button 
              onClick={() => {
                if (isFormOpen) {
                  closeForm();
                } else {
                  setViewingEvent(null);
                  openForm();
                }
              }}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              {isFormOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{isFormOpen ? "Cancel" : "Create New Event"}</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Search Bar */}
      {!isFormOpen && !viewingEvent && (
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-800 dark:text-slate-100 shadow-sm"
            placeholder="Search events, blogs, or workshops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Admin Event Creation / Edit Form */}
      {isAdmin && isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-md border border-amber-200 dark:border-amber-900/50"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <Edit3 className="w-5 h-5 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{editingId ? "Edit Event" : "Create New Event"}</h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Event Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none text-slate-800 dark:text-white font-medium"
                  placeholder="e.g. National Reading Day Celebration"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Date & Time <span className="text-red-500">*</span></label>
                <input
                  type="datetime-local"
                  required
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none text-slate-800 dark:text-white font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description <span className="text-red-500">*</span></label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none text-slate-800 dark:text-white resize-none"
                placeholder="Write the full event details here..."
              ></textarea>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-500" /> Upload Photos/Videos
              </label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-amber-50/50 dark:bg-slate-800/30 dark:hover:bg-amber-900/10 transition-colors"
              >
                <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">Click or drag files to upload media</p>
                <p className="text-slate-500 text-xs mt-1">Unlimited photos supported</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
              </div>
              
              {mediaUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                      <img src={url} alt="upload preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeMedia(idx)}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-500" /> External Video URL (YouTube, etc) (Optional)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 transition-all outline-none text-slate-800 dark:text-white"
                placeholder="https://youtube.com/..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !title || !description}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>{editingId ? "Update Event" : "Publish Event"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Events View */}
      {viewingEvent ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <button 
            onClick={() => setViewingEvent(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors w-fit"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Events
          </button>
          
          <article className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative">
            {isAdmin && (
              <div className="bg-slate-100 dark:bg-slate-800 px-6 py-3 flex justify-end gap-3 border-b border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => { setViewingEvent(null); openForm(viewingEvent); }}
                  className="px-4 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={() => setEventToDelete(viewingEvent)}
                  className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
            
            {(() => {
              const allMedia = viewingEvent.mediaUrls || (viewingEvent.imageUrl ? [viewingEvent.imageUrl] : []);
              const hasMedia = allMedia.length > 0;
              return hasMedia && (
                <div className="w-full relative bg-slate-100 dark:bg-slate-950">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                    {allMedia.map((url, idx) => (
                      <div 
                        key={idx} 
                        className={`relative overflow-hidden cursor-pointer group ${allMedia.length === 1 ? 'sm:col-span-2 md:col-span-3 h-72 md:h-96' : 'h-48 md:h-64'}`}
                        onClick={() => setLightboxIndex({ eventId: viewingEvent.id, index: idx })}
                      >
                        <img 
                          src={url} 
                          alt={`${viewingEvent.title} image ${idx + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            
            {viewingEvent.videoUrl && !(viewingEvent.mediaUrls?.length || viewingEvent.imageUrl) && (
              <div className="w-full h-64 md:h-96 relative overflow-hidden bg-slate-900 flex items-center justify-center border-b border-slate-800">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Video className="w-12 h-12" />
                  <a href={viewingEvent.videoUrl} target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">
                    Watch Video Attachment
                  </a>
                </div>
              </div>
            )}
            
            <div className="p-6 md:p-10">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm font-bold mb-4 uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                <span>{new Date(viewingEvent.timestamp).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                {viewingEvent.title}
              </h3>
              
              <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {viewingEvent.description}
              </div>
              
              {viewingEvent.videoUrl && (viewingEvent.mediaUrls?.length || viewingEvent.imageUrl) && (
                 <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                   <a href={viewingEvent.videoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
                     <Video className="w-5 h-5" />
                     Watch Associated Video
                   </a>
                 </div>
              )}
            </div>
          </article>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <p>Loading library events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-12 text-center border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No events found</h3>
              <p className="text-slate-500 max-w-md">
                Check back soon for upcoming workshops, author visits, and reading challenges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const allMedia = event.mediaUrls || (event.imageUrl ? [event.imageUrl] : []);
                const hasMedia = allMedia.length > 0;
                
                return (
                  <motion.article 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    key={event.id} 
                    onClick={() => setViewingEvent(event)}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800 cursor-pointer group flex flex-col h-full transition-all duration-300 hover:-translate-y-1"
                  >
                    {hasMedia ? (
                      <div className="w-full h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                        <img 
                          src={allMedia[0]} 
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {allMedia.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> +{allMedia.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 flex flex-col items-center justify-center text-indigo-500">
                        <Calendar className="w-10 h-10 mb-2 opacity-50" />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-grow relative">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-xs font-bold mb-3 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(event.timestamp).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {event.title}
                      </h3>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
                        {event.description}
                      </p>
                      
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                        <span className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read More <ChevronRight className="w-4 h-4" />
                        </span>
                        
                        {event.videoUrl && (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                            <Video className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
          >
            <button 
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-full max-w-5xl aspect-video md:aspect-auto md:h-[85vh] flex items-center justify-center">
              {(() => {
                const event = events.find(e => e.id === lightboxIndex.eventId);
                if (!event) return null;
                const allMedia = event.mediaUrls || (event.imageUrl ? [event.imageUrl] : []);
                return (
                  <>
                    <img 
                      src={allMedia[lightboxIndex.index]} 
                      alt="Lightbox View" 
                      className="max-w-full max-h-full object-contain"
                    />
                    {allMedia.length > 1 && (
                      <>
                        <button 
                          className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex({ eventId: event.id, index: Math.max(0, lightboxIndex.index - 1) });
                          }}
                          disabled={lightboxIndex.index === 0}
                        >
                          <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button 
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors disabled:opacity-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex({ eventId: event.id, index: Math.min(allMedia.length - 1, lightboxIndex.index + 1) });
                          }}
                          disabled={lightboxIndex.index === allMedia.length - 1}
                        >
                          <ChevronRight className="w-8 h-8" />
                        </button>
                      </>
                    )}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-medium bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md">
                      {lightboxIndex.index + 1} / {allMedia.length}
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {eventToDelete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-sm w-full p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Delete Event?</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                Are you sure you want to delete "{eventToDelete.title}"? This action cannot be undone.
              </p>
              
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setEventToDelete(null)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-500/20"
                >
                  Delete Event
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
