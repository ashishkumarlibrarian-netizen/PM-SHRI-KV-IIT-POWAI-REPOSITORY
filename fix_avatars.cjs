const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Revert the sed mess if it exists
code = code.replace(/<img src=\{currentUser\.avatarUrl\} alt="Avatar" className="w-full h-full object-cover" onError=\{\(e\) => \{ e\.currentTarget\.style\.display='none'; e\.currentTarget\.parentElement\?\.querySelector\('svg'\)\?\.classList\.remove\('hidden'\); \}\} \/><User className=\{`w-4 h-4 \$\{currentUser\.avatarUrl \? 'hidden' : ''\}`\} \/>/g, '<img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />');

code = code.replace(
`                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-800 flex items-center justify-center text-slate-400">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>`,
`                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-700 flex-shrink-0 bg-slate-800 flex items-center justify-center text-slate-400 relative">
                  {currentUser?.avatarUrl && (
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover absolute inset-0" onError={(e) => { e.currentTarget.style.display='none'; }} />
                  )}
                  <User className="w-4 h-4" />
                </div>`
);

code = code.replace(
`                              <div
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all flex-shrink-0"
                                onClick={() => {
                                  if (currentUser) setActiveTab("profile");
                                }}
                              >
                                {post.studentName === currentUser?.fullName && currentUser?.avatarUrl ? (
                                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  post.studentName.slice(0, 2)
                                )}
                              </div>`,
`                              <div
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all flex-shrink-0 relative overflow-hidden"
                                onClick={() => {
                                  if (currentUser) setActiveTab("profile");
                                }}
                              >
                                {post.studentName === currentUser?.fullName && currentUser?.avatarUrl && (
                                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover absolute inset-0 z-10" onError={(e) => { e.currentTarget.style.display='none'; }} />
                                )}
                                <span className="z-0 relative">{post.studentName.slice(0, 2)}</span>
                              </div>`
);

fs.writeFileSync('src/App.tsx', code);
