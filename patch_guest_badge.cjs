const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldGuestCode = `
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-amber-500 font-sans">
                  Guest Scholar
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Offline session
                </span>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                id="header-login-btn"
                className="px-2 md:px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-md hover:shadow-amber-500/10 hover:border-amber-400 border border-amber-500 whitespace-nowrap"
              >
                Sign In
              </button>
            </div>
          )}
`;

const newGuestCode = `
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsAuthOpen(true)}
              >
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-amber-500 font-sans">
                    Guest Scholar
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Offline session
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <button
                onClick={() => setIsAuthOpen(true)}
                id="header-login-btn"
                className="px-2 md:px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all shadow-md hover:shadow-amber-500/10 hover:border-amber-400 border border-amber-500 whitespace-nowrap"
              >
                Sign In
              </button>
            </div>
          )}
`;

code = code.replace(oldGuestCode.trim(), newGuestCode.trim());
fs.writeFileSync('src/App.tsx', code);
