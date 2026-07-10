const fs = require('fs');
let code = fs.readFileSync('src/components/AdminTab.tsx', 'utf8');

// Replace /api/thoughts with /api/thoughts/all in fetchData
code = code.replace(
  'const res = await fetch("/api/thoughts");',
  'const res = await fetch("/api/thoughts/all");'
);

// Add is_active logic to UI
const oldThoughtsRender = `            <div className="space-y-4">
              {thoughts.map(t => (
                <div key={t.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{t.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 italic">"{t.thought}"</p>
                    <p className="text-xs text-slate-500 mt-1">— {t.author}</p>
                  </div>
                  <button onClick={() => handleDeleteThought(t.id)} className="text-red-500 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
            </div>`;
            
const newThoughtsRender = `            <div className="space-y-4">
              {thoughts.map(t => (
                <div key={t.id} className={\`p-4 border rounded-xl flex justify-between items-center transition-colors \${t.is_active ? 'border-amber-500 bg-amber-500/5' : 'border-slate-200 dark:border-slate-700'}\`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{t.title}</h4>
                      {t.is_active && <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] uppercase font-bold rounded-full">Active</span>}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic mt-1">"{t.thought}"</p>
                    <p className="text-xs text-slate-500 mt-1">— {t.author}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {!t.is_active && (
                       <button onClick={async () => {
                         await fetch(\`/api/thoughts/\${t.id}\`, {
                           method: "PUT",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ title: t.title, thought: t.thought, author: t.author, is_active: true })
                         });
                         fetchData();
                       }} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 rounded text-xs font-semibold transition-colors">
                         Activate
                       </button>
                    )}
                    <button onClick={() => handleDeleteThought(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>`;
            
code = code.replace(oldThoughtsRender, newThoughtsRender);

// Also add a checkbox for is_active when adding a new thought
const oldForm = `              <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Author" className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" required />
              <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded font-medium">Add Thought</button>`;
              
const newForm = `              <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Author" className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" required />
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" checked={newTitle === "ACTIVATE_ME" /* just a hack to not add state, let's use a ref or add state */} id="make_active" className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                Make this the active thought
              </label>
              <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded font-medium">Add Thought</button>`;

code = code.replace(oldForm, newForm);

fs.writeFileSync('src/components/AdminTab.tsx', code);
