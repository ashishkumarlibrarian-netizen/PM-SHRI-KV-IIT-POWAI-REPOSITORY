const fs = require('fs');
let code = fs.readFileSync('src/components/AdminTab.tsx', 'utf8');

// I am going to replace the activeSection === "thoughts" block entirely.
const thoughtsBlockRegex = /\{activeSection === "thoughts" && \([\s\S]*?\)\}\s*\{activeSection === "posts"/;
const newThoughtsBlock = `{activeSection === "thoughts" && (
          <ThoughtManager thoughts={thoughts} fetchData={fetchData} handleDeleteThought={handleDeleteThought} />
        )}
        {activeSection === "posts"`;

code = code.replace(thoughtsBlockRegex, newThoughtsBlock);

// Also need to add the ThoughtManager component at the top of the file.
const imports = `import React, { useState, useEffect } from "react";
import { MessageSquare, Lightbulb, UserCircle, Trash2, Edit2, Pin, Shield, Save, X, Plus } from "lucide-react";
import { SocialFeedPost } from "../types";

function ThoughtManager({ thoughts, fetchData, handleDeleteThought }: any) {
  const [editingThought, setEditingThought] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "", thought: "", author: "", is_active: false,
    icon: "✨", bg_color: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
    text_color: "text-amber-400", border_color: "border-amber-500/30",
    gradient_start: "from-amber-400", gradient_end: "to-amber-600", display_order: 0
  });

  const resetForm = () => {
    setFormData({
      title: "", thought: "", author: "", is_active: false,
      icon: "✨", bg_color: "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      text_color: "text-amber-400", border_color: "border-amber-500/30",
      gradient_start: "from-amber-400", gradient_end: "to-amber-600", display_order: 0
    });
    setEditingThought(null);
    setIsAdding(false);
  };

  const handleEdit = (t: any) => {
    setFormData({
      title: t.title || "", thought: t.thought || "", author: t.author || "", is_active: t.is_active || false,
      icon: t.icon || "✨", bg_color: t.bg_color || "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      text_color: t.text_color || "text-amber-400", border_color: t.border_color || "border-amber-500/30",
      gradient_start: t.gradient_start || "from-amber-400", gradient_end: t.gradient_end || "to-amber-600", display_order: t.display_order || 0
    });
    setEditingThought(t);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingThought ? \`/api/thoughts/\${editingThought.id}\` : "/api/thoughts";
    const method = editingThought ? "PUT" : "POST";
    
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    resetForm();
    fetchData();
  };

  const toggleActive = async (t: any) => {
    await fetch(\`/api/thoughts/\${t.id}\`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, is_active: !t.is_active })
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      {!isAdding ? (
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">All Thoughts</h3>
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add New Thought
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">{editingThought ? 'Edit Thought' : 'Add New Thought'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Basic Info</label>
                <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Title (e.g., Motivation)" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" required />
                <textarea value={formData.thought} onChange={e => setFormData({...formData, thought: e.target.value})} placeholder="Thought text..." className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-[100px]" required />
                <input value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} placeholder="Author" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" required />
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Design & Colors (Tailwind Classes)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} placeholder="Icon (emoji)" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                  <input value={formData.text_color} onChange={e => setFormData({...formData, text_color: e.target.value})} placeholder="Text Color" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                  <input value={formData.bg_color} onChange={e => setFormData({...formData, bg_color: e.target.value})} placeholder="Background Color" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 col-span-2" />
                  <input value={formData.border_color} onChange={e => setFormData({...formData, border_color: e.target.value})} placeholder="Border Color" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 col-span-2" />
                  <input value={formData.gradient_start} onChange={e => setFormData({...formData, gradient_start: e.target.value})} placeholder="Gradient Start" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                  <input value={formData.gradient_end} onChange={e => setFormData({...formData, gradient_end: e.target.value})} placeholder="Gradient End" className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100" />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="rounded text-amber-500 w-5 h-5 focus:ring-amber-500" />
                  Set as Active Thought
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors">
                  <Save className="w-4 h-4" /> {editingThought ? 'Update Thought' : 'Save Thought'}
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-medium transition-colors">
                  Cancel
                </button>
              </div>
            </form>

            {/* Live Preview */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Live Preview</label>
              <div className={\`w-full \${formData.bg_color} backdrop-blur-xl rounded-2xl p-8 border \${formData.border_color} relative overflow-hidden shadow-sm\`}>
                <div className={\`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b \${formData.gradient_start} \${formData.gradient_end} shadow-[0_0_10px_rgba(245,158,11,0.5)]\`}></div>
                <div className={\`absolute top-0 right-0 w-64 h-full bg-gradient-to-l \${formData.gradient_start} to-transparent opacity-50\`}></div>
                
                <div className="flex flex-col gap-6 relative z-10">
                  <div className={\`flex items-center gap-2 text-xs font-bold uppercase tracking-widest \${formData.text_color}\`}>
                     <span className="text-xl">{formData.icon}</span> {formData.title || 'Title Preview'}
                  </div>
                  
                  <div className="border-l border-current/10 pl-6 py-2">
                    <p className={\`text-lg italic font-medium leading-relaxed \${formData.text_color ? 'text-current opacity-90' : 'text-slate-200'}\`}>
                      "{formData.thought || 'Thought text preview will appear here...'}"
                    </p>
                    <p className={\`text-sm font-semibold mt-4 flex items-center gap-2 \${formData.text_color ? 'text-current opacity-70' : 'text-slate-400'}\`}>
                      <span className="w-4 h-[1px] bg-current opacity-50"></span>
                      {formData.author || 'Author Name'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {!isAdding && (
        <div className="space-y-4">
          {thoughts.length === 0 && (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              No thoughts added yet. Create one to get started!
            </div>
          )}
          {thoughts.map((t: any) => (
            <div key={t.id} className={\`p-5 border rounded-xl flex flex-col md:flex-row md:items-center gap-4 transition-colors \${t.is_active ? 'border-amber-500 bg-amber-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}\`}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.icon || '✨'}</span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{t.title}</h4>
                  {t.is_active && <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] uppercase tracking-widest font-bold rounded-full">Active</span>}
                </div>
                <p className="text-slate-600 dark:text-slate-400 italic">"{t.thought}"</p>
                <p className="text-sm text-slate-500 font-medium">— {t.author}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(t)} className={\`px-4 py-2 rounded-lg text-sm font-semibold transition-colors \${t.is_active ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-600 hover:bg-amber-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-amber-900/20'}\`}>
                  {t.is_active ? 'Active' : 'Make Active'}
                </button>
                <button onClick={() => handleEdit(t)} className="p-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteThought(t.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(
  'import React, { useState, useEffect } from "react";\nimport { MessageSquare, Lightbulb, UserCircle, Trash2, Edit2, Pin, Shield } from "lucide-react";\nimport { SocialFeedPost } from "../types";',
  imports
);

// We should also remove the redundant handlers inside AdminTab since ThoughtManager now handles them internally,
// But to prevent breaking, we'll just leave the old `handleAddThought` and unused state there, it doesn't hurt.
// However, `handleDeleteThought` is passed as a prop, which is fine.

fs.writeFileSync('src/components/AdminTab.tsx', code);
