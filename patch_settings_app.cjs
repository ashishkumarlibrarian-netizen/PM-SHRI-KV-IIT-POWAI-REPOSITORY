const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const fetchSettingsCode = `
  const [librarySettings, setLibrarySettings] = useState({
    logoUrl: "",
    name: "PM SHRI SCHOOL",
    tag: "IIT POWAI SECTOR"
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editSettingsForm, setEditSettingsForm] = useState({ ...librarySettings });

  useEffect(() => {
    fetch('/api/settings/library')
      .then(r => r.json())
      .then(data => {
        setLibrarySettings(data);
        setEditSettingsForm(data);
      })
      .catch(console.error);
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/settings/library', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: \`Bearer \${currentUser?.token}\`,
        },
        body: JSON.stringify(editSettingsForm)
      });
      if (response.ok) {
        const updated = await response.json();
        setLibrarySettings(updated);
        setIsEditingSettings(false);
      }
    } catch (err) {
      console.error(err);
    }
  };
`;

code = code.replace(
  'const [theme, setTheme] = useState<"light" | "dark">("dark");',
  fetchSettingsCode + '\n  const [theme, setTheme] = useState<"light" | "dark">("dark");'
);

const oldHeader = `
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden border border-slate-700/50 shadow flex-shrink-0">
            <img
              src={kvLogo}
              alt="PM Shri KV IIT Powai Library Logo"
              title="PM Shri KV IIT Powai Library"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
              <span className="text-[9px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans tracking-wide whitespace-nowrap flex-shrink-0">
                <span className="md:hidden">PM SHRI</span>
                <span className="hidden md:inline">PM SHRI SCHOOL</span>
              </span>
              <span className="hidden sm:inline text-[10px] md:text-[11px] font-mono text-cyan-400 whitespace-nowrap truncate min-w-0">
                IIT POWAI SECTOR
              </span>
            </div>
            <h1 className="text-xs sm:text-sm md:text-lg font-bold leading-none tracking-tight text-white mt-1 truncate">
              KV IIT Powai Digital Library Hub
            </h1>
          </div>
`;

const newHeader = `
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden border border-slate-700/50 shadow flex-shrink-0">
            <img
              src={librarySettings.logoUrl || kvLogo}
              alt="Library Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
              <span className="text-[9px] md:text-xs font-semibold px-1.5 md:px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans tracking-wide whitespace-nowrap flex-shrink-0">
                <span>{librarySettings.name}</span>
              </span>
              <span className="hidden sm:inline text-[10px] md:text-[11px] font-mono text-cyan-400 whitespace-nowrap truncate min-w-0">
                {librarySettings.tag}
              </span>
              {currentUser?.role === "admin" && (
                <button onClick={() => setIsEditingSettings(true)} className="ml-2 text-xs text-amber-500 hover:text-amber-300">
                   <Wrench className="w-3 h-3" />
                </button>
              )}
            </div>
            <h1 className="text-xs sm:text-sm md:text-lg font-bold leading-none tracking-tight text-white mt-1 truncate">
              KV IIT Powai Digital Library Hub
            </h1>
          </div>
`;

if (code.includes(oldHeader.trim())) {
    code = code.replace(oldHeader, newHeader);
} else {
    // try exact regex
    code = code.replace(/<div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden border border-slate-700\/50 shadow flex-shrink-0">[\s\S]*?KV IIT Powai Digital Library Hub\n            <\/h1>\n          <\/div>/, newHeader.trim());
}

const editSettingsModal = `
      {/* Settings Modal */}
      {isEditingSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Edit Library Header Settings</h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editSettingsForm.name} 
                  onChange={e => setEditSettingsForm({...editSettingsForm, name: e.target.value})} 
                  className="w-full border dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tagline / Sector</label>
                <input 
                  type="text" 
                  value={editSettingsForm.tag} 
                  onChange={e => setEditSettingsForm({...editSettingsForm, tag: e.target.value})} 
                  className="w-full border dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo Image URL (Optional)</label>
                <input 
                  type="text" 
                  value={editSettingsForm.logoUrl} 
                  onChange={e => setEditSettingsForm({...editSettingsForm, logoUrl: e.target.value})} 
                  className="w-full border dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800"
                  placeholder="https://..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsEditingSettings(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

code = code.replace(
  '{/* Auth Modal Portal */}',
  editSettingsModal + '\n      {/* Auth Modal Portal */}'
);

fs.writeFileSync('src/App.tsx', code);
