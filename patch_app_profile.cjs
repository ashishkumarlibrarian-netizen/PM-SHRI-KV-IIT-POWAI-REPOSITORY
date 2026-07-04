const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('import ProfileTab')) {
    code = code.replace(
      'import MenuTab from "./components/MenuTab";',
      'import ProfileTab from "./components/ProfileTab";\nimport MenuTab from "./components/MenuTab";'
    );
}

if (!code.includes('"profile"')) {
    code = code.replace(
      'const validTabs = ["dashboard", "story", "books", "creative", "social", "menu", "magazine", "readers-club", "staff", "events", "career-guidance"] as const;',
      'const validTabs = ["dashboard", "story", "books", "creative", "social", "menu", "magazine", "readers-club", "staff", "events", "career-guidance", "profile"] as const;'
    );
}

code = code.replace(
  '{activeTab === "menu" && <MenuTab />}',
  '{activeTab === "profile" && <ProfileTab currentUser={currentUser} onUpdate={(u) => { setCurrentUser(u); setStudentName(u.fullName); localStorage.setItem("kv_library_user", JSON.stringify(u)); }} />}\n        {activeTab === "menu" && <MenuTab />}'
);

const oldStudentHeader = `
            <div className="flex flex-col items-end mr-2">
              <span className="text-[11px] font-bold text-amber-500 whitespace-nowrap">{studentName}</span>
              <span className="text-[9px] text-emerald-400 font-mono tracking-widest flex items-center gap-1 whitespace-nowrap">
                <CheckCircle2 className="w-2.5 h-2.5" /> Registered Student
              </span>
            </div>
`;

const newStudentHeader = `
            <div 
              className="flex flex-col items-end mr-2 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => setActiveTab("profile")}
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-bold text-amber-500 whitespace-nowrap">{studentName}</span>
                  <span className="text-[9px] text-emerald-400 font-mono tracking-widest flex items-center gap-1 whitespace-nowrap">
                    <CheckCircle2 className="w-2.5 h-2.5" /> Registered Student
                  </span>
                </div>
                {currentUser?.avatarUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0">
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                ) : null}
              </div>
            </div>
`;

code = code.replace(oldStudentHeader.trim(), newStudentHeader.trim());

fs.writeFileSync('src/App.tsx', code);
