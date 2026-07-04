const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldHeaderDetails = `
                          {/* Header details */}
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-100/50 text-red-800 font-bold flex items-center justify-center uppercase">
                                {post.studentName.slice(0, 2)}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                                    {post.studentName}
                                  </h4>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {post.timestamp}
                                </p>
                              </div>
                            </div>
`;

const newHeaderDetails = `
                          {/* Header details */}
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 items-center">
                              <div 
                                className="w-10 h-10 rounded-full bg-red-100/50 text-red-800 font-bold flex items-center justify-center uppercase cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all overflow-hidden"
                                onClick={() => {
                                  if (currentUser) setActiveTab("profile");
                                }}
                              >
                                {post.studentName === currentUser?.fullName && currentUser?.avatarUrl ? (
                                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                  post.studentName.slice(0, 2)
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 
                                    className="font-bold text-xs text-slate-800 dark:text-slate-100 cursor-pointer hover:text-amber-600 transition-colors"
                                    onClick={() => {
                                      if (currentUser) setActiveTab("profile");
                                    }}
                                  >
                                    {post.studentName}
                                  </h4>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {post.timestamp}
                                </p>
                              </div>
                            </div>
`;

code = code.replace(oldHeaderDetails.trim(), newHeaderDetails.trim());
fs.writeFileSync('src/App.tsx', code);
