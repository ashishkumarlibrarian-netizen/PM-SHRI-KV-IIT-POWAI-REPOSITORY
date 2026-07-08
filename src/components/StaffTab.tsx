import { uploadFile, uuidv4 } from "../lib/upload";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, BookHeart, User, Edit2, Plus, Trash2, Save, X, Camera } from "lucide-react";

export default function StaffTab({ currentUser }: { currentUser: any }) {
  const [staffData, setStaffData] = useState<any>({ staffMembers: [], editorialTeam: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({ staffMembers: [], editorialTeam: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  const isAdmin = currentUser?.role === 'admin' || currentUser?.fullName === 'Ashish Kumar';

  useEffect(() => {
    fetch("/api/settings/staff")
      .then(res => res.json())
      .then(data => {
        setStaffData(JSON.parse(JSON.stringify(data)));
        setEditData(JSON.parse(JSON.stringify(data)));
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch staff data:", err);
        setIsLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaveStatus("Saving...");
    try {
      const res = await fetch("/api/settings/staff", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("kv_library_token")}`
        },
        body: JSON.stringify(editData)
      });
      if (res.ok) {
        setStaffData(JSON.parse(JSON.stringify(editData)));
        setIsEditing(false);
        setSaveStatus("");
      } else {
        const errorData = await res.json().catch(() => ({}));
        const detailedError = errorData.details || errorData.error || "Unknown server error";
        setSaveStatus(`Failed: ${detailedError}`);
        alert(`Failed to save staff members: ${detailedError}`);
      }
    } catch (err: any) {
      setSaveStatus("Failed to save");
      alert(`An error occurred: ${err.message || err}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, listType: 'staffMembers'|'editorialTeam', index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const publicUrl = await uploadFile(file, 'staff');
        const newData = JSON.parse(JSON.stringify(editData));
        newData[listType][index].image = publicUrl;
        setEditData(newData);
      } catch (err: any) {
        console.error("Upload failed:", err);
        alert(`Upload failed: ${err.message || err}`);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center p-12 text-slate-500">Loading...</div>;
  }

  if (isEditing) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
        <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Team Members</h2>
          <div className="flex gap-3">
            <button onClick={() => { setIsEditing(false); setEditData(JSON.parse(JSON.stringify(staffData))); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center gap-2">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-2">
              <Save className="w-4 h-4" /> {saveStatus || "Save Changes"}
            </button>
          </div>
        </div>

        {['staffMembers', 'editorialTeam'].map((listType) => (
          <div key={listType} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
                {listType.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <button 
                onClick={() => {
                  const newData = JSON.parse(JSON.stringify(editData));
                  newData[listType].push({
                    id: uuidv4(),
                    name: "New Member",
                    role: "Role",
                    contribution: "Description...",
                    avatarColor: "bg-indigo-100 text-indigo-700",
                    years: "1 Year",
                    image: ""
                  });
                  setEditData(newData);
                }}
                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold rounded-lg flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            
            <div className="space-y-4">
              {editData[listType].map((member: any, idx: number) => (
                <div key={member.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border flex flex-col items-center justify-center">
                      {member.image ? <img src={member.image} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-400" />}
                    </div>
                    <label className="cursor-pointer text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1">
                      <Camera className="w-3 h-3" /> Upload
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, listType as any, idx)} className="hidden" />
                    </label>
                  </div>
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div><label className="text-xs font-bold text-slate-500">Name</label><input type="text" value={member.name} onChange={(e) => { const n={...editData}; n[listType][idx].name = e.target.value; setEditData(n); }} className="w-full border rounded p-2 dark:bg-slate-800 text-sm" /></div>
                    <div><label className="text-xs font-bold text-slate-500">Position / Role</label><input type="text" value={member.role} onChange={(e) => { const n={...editData}; n[listType][idx].role = e.target.value; setEditData(n); }} className="w-full border rounded p-2 dark:bg-slate-800 text-sm" /></div>
                    <div><label className="text-xs font-bold text-slate-500">Experience / Years</label><input type="text" value={member.years} onChange={(e) => { const n={...editData}; n[listType][idx].years = e.target.value; setEditData(n); }} className="w-full border rounded p-2 dark:bg-slate-800 text-sm" /></div>
                    <div><label className="text-xs font-bold text-slate-500">Color Theme (Tailwind Classes)</label><input type="text" value={member.avatarColor} onChange={(e) => { const n={...editData}; n[listType][idx].avatarColor = e.target.value; setEditData(n); }} className="w-full border rounded p-2 dark:bg-slate-800 text-sm" /></div>
                    <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500">Description / Contribution</label><textarea value={member.contribution} onChange={(e) => { const n={...editData}; n[listType][idx].contribution = e.target.value; setEditData(n); }} className="w-full border rounded p-2 dark:bg-slate-800 text-sm h-20" /></div>
                  </div>
                  <button onClick={() => { const n={...editData}; n[listType].splice(idx, 1); setEditData(n); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg flex-shrink-0 mt-4 md:mt-0">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {isAdmin && (
          <button 
            onClick={() => { setEditData(JSON.parse(JSON.stringify(staffData))); setIsEditing(true); }}
            className="absolute top-4 right-4 z-20 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4" /> Edit Team
          </button>
        )}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
            <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
            Library Team
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Honoring the dedicated staff members who have made significant contributions to our library's growth, resources, and reading culture.
          </p>
        </div>
      </div>

      {/* Senior Staff Profile */}
      <div className="flex flex-wrap justify-center gap-8">
        {staffData.staffMembers.map((staff: any, idx: number) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={staff.id || idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-shadow group flex flex-col md:flex-row gap-8 items-center w-full max-w-4xl"
          >
            <div className={`w-40 h-40 md:w-48 md:h-48 rounded-3xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner ${staff.avatarColor || 'bg-slate-100 text-slate-400'}`}>
              {staff.image ? (
                <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-20 h-20" />
              )}
            </div>
            
            <div className="flex-grow space-y-4 text-center md:text-left">
              <div>
                <h3 className="text-3xl font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {staff.name}
                </h3>
                <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {staff.role}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
                "{staff.contribution}"
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className={`p-2 rounded-xl ${staff.avatarColor || 'bg-slate-100 text-slate-400'} bg-opacity-20`}>
                  <BookHeart className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Dedicated service for {staff.years}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Caravan Editorial Team Header */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 mt-12 text-center">
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center justify-center gap-3">
          <BookHeart className="w-6 h-6 text-emerald-500" />
          Caravan Editorial Team
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
          The creative minds behind our library's publications and newsletters.
        </p>
      </div>

      {/* Caravan Editorial Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {staffData.editorialTeam.map((staff: any, idx: number) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={staff.id || idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6 items-start"
          >
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden ${staff.avatarColor || 'bg-slate-100 text-slate-400'}`}>
              {staff.image ? (
                <img src={staff.image} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10" />
              )}
            </div>
            
            <div className="flex-grow space-y-3">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {staff.name}
                </h3>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {staff.role}
                </p>
              </div>
              
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                "{staff.contribution}"
              </p>
              
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className={`p-1.5 rounded-lg ${staff.avatarColor || 'bg-slate-100 text-slate-400'} bg-opacity-20`}>
                  <BookHeart className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Contributing for {staff.years}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-indigo-100 dark:border-indigo-800/30 text-center">
        <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
          Want to contribute?
        </h3>
        <p className="text-indigo-700 dark:text-indigo-300 text-sm max-w-lg mx-auto">
          We welcome suggestions, book donations, and volunteer support from all staff members to continue making our library a beacon of knowledge.
        </p>
      </div>
    </div>
  );
}
