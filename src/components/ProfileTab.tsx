import { uploadFile } from "../lib/upload";
import React, { useState } from "react";
import { User, Lock, Save, Camera } from "lucide-react";

export default function ProfileTab({ currentUser, onUpdate }: { currentUser: any; onUpdate: (user: any) => void }) {
  const [name, setName] = useState(currentUser?.fullName || "");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || "");
  const [statusMessage, setStatusMessage] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user/profile', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("kv_library_token")}`,
        },
        body: JSON.stringify({ fullName: name, password, avatarUrl })
      });
      if (response.ok) {
        const data = await response.json();
        const updated = data.user || {};
        onUpdate({ 
          ...currentUser, 
          fullName: updated.fullName || name, 
          avatarUrl: updated.avatarUrl || avatarUrl 
        });
        setStatusMessage("Profile updated successfully!");
        setPassword("");
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        const errText = await response.text();
        setStatusMessage("Failed to update: " + errText);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to update profile.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStatusMessage("Uploading avatar...");
      try {
        const publicUrl = await uploadFile(file, 'profiles');
        setAvatarUrl(publicUrl);
        
        // Auto-save the avatar
        const response = await fetch('/api/user/profile', {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("kv_library_token")}`,
          },
          body: JSON.stringify({ avatarUrl: publicUrl })
        });
        if (response.ok) {
           const data = await response.json();
           const updated = data.user || {};
           onUpdate({ 
             ...currentUser, 
             avatarUrl: updated.avatarUrl || publicUrl 
           });
           setStatusMessage("Avatar updated successfully!");
        } else {
           setStatusMessage("Failed to save avatar");
        }
        setTimeout(() => setStatusMessage(""), 3000);
      } catch (err: any) {
        console.error("Upload error caught:", err);
        setStatusMessage(`Upload failed: ${err.message || err}`);
        setTimeout(() => setStatusMessage(""), 3000);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Edit Profile</h2>
        {statusMessage && (
          <div className={`p-4 rounded-xl mb-6 \${statusMessage.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {statusMessage}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement?.querySelector('svg')?.classList.remove('hidden'); }} />
                ) : null}
                <User className={`w-12 h-12 ${avatarUrl ? 'hidden' : ''}`} />
              </div>
              <label className="cursor-pointer bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2">
                <Camera className="w-4 h-4" /> Change Avatar
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
