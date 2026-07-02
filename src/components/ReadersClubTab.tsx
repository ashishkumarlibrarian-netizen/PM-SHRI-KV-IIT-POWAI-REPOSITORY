import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Award, BookHeart, User, Heart, Star, BookOpen, Folder, ArrowLeft, ChevronRight, Plus, Trash2, Edit2, Loader2, Save, X } from "lucide-react";

export default function ReadersClubTab({ isAdmin }: { isAdmin?: boolean }) {
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Admin states
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("text-blue-600 bg-blue-100 dark:bg-blue-900/50");
  const [newFolderLogo, setNewFolderLogo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "Member", contribution: "", grade: "", avatarColor: "bg-blue-100 text-blue-700", image: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/readers-club");
      const data = await res.json();
      if (data.folders && data.folders.length > 0) {
        setFolders(data.folders);
      } else {
        // Default data
        const initialFolders = [
          { 
            id: "committee", name: "Core Committee", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/50", 
            members: [
              { name: "Rohan Patel", role: "President", contribution: "Organized the inter-school reading competition and established the weekly peer-reading sessions.", avatarColor: "bg-blue-100 text-blue-700", grade: "Class X-A" },
              { name: "Sneha Iyer", role: "Secretary", contribution: "Maintained the reading logs for junior classes and managed the library book review board.", avatarColor: "bg-pink-100 text-pink-700", grade: "Class IX-B" }
            ] 
          },
          { 
            id: "class6", name: "Class 6th", color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/50", 
            members: [
              { name: "Bandi Madhava", role: "Member", contribution: "Active participant in weekly book discussions.", avatarColor: "bg-indigo-100 text-indigo-700", grade: "Class VI B" }
            ] 
          }
        ];
        setFolders(initialFolders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (updatedFolders: any[]) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("kv_library_token");
      const res = await fetch("/api/readers-club", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ folders: updatedFolders })
      });
      if (res.ok) {
        setFolders(updatedFolders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;
    const updated = [...folders, { 
      id: Date.now().toString(), 
      name: newFolderName, 
      color: newFolderColor, 
      logo: newFolderLogo, 
      members: [] 
    }];
    setNewFolderLogo("");
    await saveData(updated);
    setNewFolderName("");
    setIsAddingFolder(false);
  };

  const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this folder?")) {
      const updated = folders.filter(f => f.id !== id);
      await saveData(updated);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name.trim() || !activeFolderId) return;
    const updated = folders.map(f => {
      if (f.id === activeFolderId) {
        return { ...f, members: [...f.members, { ...newMember }] };
      }
      return f;
    });
    await saveData(updated);
    setIsAddingMember(false);
    setNewMember({ name: "", role: "Member", contribution: "", grade: "", avatarColor: "bg-blue-100 text-blue-700", image: "" });
  };

  const handleDeleteMember = async (idx: number) => {
    if (!activeFolderId || !confirm("Delete this member?")) return;
    const updated = folders.map(f => {
      if (f.id === activeFolderId) {
        return { ...f, members: f.members.filter((_: any, i: number) => i !== idx) };
      }
      return f;
    });
    await saveData(updated);
  };

  const handleFolderLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewFolderLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewMember(prev => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  const activeFolder = folders.find(f => f.id === activeFolderId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Reader's Club
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Celebrating the passionate students who lead reading initiatives, foster literary discussions, and contribute to our vibrant library community.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!activeFolderId ? (
          <motion.div
            key="folders"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {isAdmin && (
              <div className="flex justify-end">
                <button 
                  onClick={() => setIsAddingFolder(!isAddingFolder)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow transition-colors flex items-center gap-2"
                >
                  {isAddingFolder ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {isAddingFolder ? "Cancel" : "New Folder"}
                </button>
              </div>
            )}

            {isAddingFolder && isAdmin && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Folder Name</label>
                  <input 
                    type="text" 
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="e.g. Science Fiction Club"
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Folder Logo</label>
                  <input type="file" accept="image/*" onChange={handleFolderLogoUpload} className="w-full text-sm text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                </div>
                <button 
                  onClick={handleAddFolder}
                  disabled={isSaving}
                  className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Folder
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {folders.map((folder, idx) => (
                <div key={folder.id} className="relative group">
                  <button
                    onClick={() => setActiveFolderId(folder.id)}
                    className="w-full bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-4 group/btn"
                  >
                    <div className={`p-4 rounded-2xl ${folder.color} group-hover/btn:scale-110 transition-transform`}>
                      {folder.logo ? <img src={folder.logo} alt="Folder Logo" className="w-8 h-8 object-cover rounded-lg" /> : <Folder className="w-8 h-8" />}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {folder.members?.length || 0} Members
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover/btn:text-blue-500 transition-colors" />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDeleteFolder(folder.id, e)}
                      className="absolute top-2 right-2 p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="folder-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFolderId(null)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-600 dark:text-slate-300"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  {activeFolder?.logo ? <img src={activeFolder.logo} alt="Folder Logo" className="w-6 h-6 object-cover rounded flex-shrink-0" /> : <Folder className="w-5 h-5 text-blue-500" />}
                  {activeFolder?.name}
                </h3>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => setIsAddingMember(!isAddingMember)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow transition-colors flex items-center gap-2"
                >
                  {isAddingMember ? "Cancel" : "Add Participant"}
                </button>
              )}
            </div>
            
            {isAddingMember && isAdmin && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-slate-200">Add New Participant</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                    <input type="text" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
                    <input type="text" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Grade / Class</label>
                    <input type="text" value={newMember.grade} onChange={e => setNewMember({...newMember, grade: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Profile Photo (Logo)</label>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Contribution</label>
                    <textarea value={newMember.contribution} onChange={e => setNewMember({...newMember, contribution: e.target.value})} rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleAddMember} disabled={isSaving} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold transition-colors flex items-center gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Participant
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {activeFolder?.members?.map((member: any, idx: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6 items-start relative"
                >
                  {isAdmin && (
                    <button onClick={() => handleDeleteMember(idx)} className="absolute top-4 right-4 p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${member.avatarColor || 'bg-slate-100 text-slate-500'}`}>
                    {member.image ? (
                      <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                  </div>
                  
                  <div className="flex-grow space-y-3">
                    <div className="pr-8">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {member.role}
                      </p>
                    </div>
                    
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      "{member.contribution}"
                    </p>
                    
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {member.grade}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
