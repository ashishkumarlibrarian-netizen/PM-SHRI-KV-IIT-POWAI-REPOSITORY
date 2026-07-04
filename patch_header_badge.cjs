const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldCode = `
        {/* Quick User Badge */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex flex-col text-right animate-fade-in">
                <span className="text-xs font-bold text-amber-400">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                  ✓ Registered Student
                </span>
              </div>
              <button
                onClick={handleLogout}
                id="header-logout-btn"
                className="px-2 md:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 hover:text-red-400 text-slate-300 rounded-lg text-[10px] md:text-[11px] font-bold transition-all border border-slate-700 font-sans"
              >
                Sign Out
              </button>
            </div>
`;

const newCode = `
        {/* Quick User Badge */}
        <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => setActiveTabState("profile")}
              >
                <div className="hidden md:flex flex-col text-right animate-fade-in">
                  <span className="text-xs font-bold text-amber-400">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                    ✓ Registered Student
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-800 flex items-center justify-center text-slate-400">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              </div>
              <button
                onClick={handleLogout}
                id="header-logout-btn"
                className="px-2 md:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 hover:text-red-400 text-slate-300 rounded-lg text-[10px] md:text-[11px] font-bold transition-all border border-slate-700 font-sans"
              >
                Sign Out
              </button>
            </div>
`;

code = code.replace(oldCode.trim(), newCode.trim());
fs.writeFileSync('src/App.tsx', code);
