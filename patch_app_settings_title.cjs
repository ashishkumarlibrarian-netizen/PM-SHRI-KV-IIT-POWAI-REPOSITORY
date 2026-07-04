const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldSettingsInit = `
  const [librarySettings, setLibrarySettings] = useState({
    logoUrl: "",
    name: "PM SHRI SCHOOL",
    tag: "IIT POWAI SECTOR"
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editSettingsForm, setEditSettingsForm] = useState({ logoUrl: "", name: "", tag: "" });
`;

const newSettingsInit = `
  const [librarySettings, setLibrarySettings] = useState({
    logoUrl: "",
    name: "PM SHRI SCHOOL",
    tag: "IIT POWAI SECTOR",
    headerTitle: "KV IIT Powai Digital Library Hub"
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editSettingsForm, setEditSettingsForm] = useState({ logoUrl: "", name: "", tag: "", headerTitle: "" });
`;

code = code.replace(oldSettingsInit.trim(), newSettingsInit.trim());

const oldTitleRender = `
            <h1 className="text-xs sm:text-sm md:text-lg font-bold leading-none tracking-tight text-white mt-1 truncate">
              KV IIT Powai Digital Library Hub
            </h1>
`;

const newTitleRender = `
            <h1 className="text-xs sm:text-sm md:text-lg font-bold leading-none tracking-tight text-white mt-1 truncate">
              {librarySettings.headerTitle || "KV IIT Powai Digital Library Hub"}
            </h1>
`;

code = code.replace(oldTitleRender.trim(), newTitleRender.trim());

const oldSettingsForm = `
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tagline / Sector</label>
                <input 
                  type="text" 
                  value={editSettingsForm.tag} 
                  onChange={e => setEditSettingsForm({...editSettingsForm, tag: e.target.value})} 
                  className="w-full border dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800"
                />
              </div>
`;

const newSettingsForm = `
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Header Title</label>
                <input 
                  type="text" 
                  value={editSettingsForm.headerTitle} 
                  onChange={e => setEditSettingsForm({...editSettingsForm, headerTitle: e.target.value})} 
                  className="w-full border dark:border-slate-700 rounded-lg p-2 dark:bg-slate-800"
                />
              </div>
`;

code = code.replace(oldSettingsForm.trim(), newSettingsForm.trim());

fs.writeFileSync('src/App.tsx', code);
