const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldRender = `                            {commsList.length > 0 && (
                              <div className="space-y-2">
                                {commsList.map((commText, idx) => (
                                  <div
                                    key={idx}
                                    className="text-xs p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed text-slate-600 dark:text-slate-300"
                                  >
                                    {commText}
                                  </div>
                                ))}
                              </div>
                            )}`;

const newRender = `                            {commsList.length > 0 && (
                              <div className="space-y-2">
                                {commsList.map((commObj: any, idx: number) => {
                                  const isString = typeof commObj === 'string';
                                  const cId = isString ? \`\${idx}\` : commObj.id;
                                  const cText = isString ? commObj : commObj.text;
                                  const cAuthor = isString ? commObj.split(':')[0] : (commObj.authorName || 'User');
                                  const cAvatar = isString ? '' : commObj.authorAvatar;
                                  const isMyComment = currentUser && currentUser.fullName === cAuthor;
                                  
                                  let displayText = cText;
                                  if (isString && cText.includes(':')) {
                                    displayText = cText.split(':').slice(1).join(':').trim();
                                  }

                                  return (
                                    <div
                                      key={cId}
                                      className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800"
                                    >
                                      {cAvatar ? (
                                        <img src={cAvatar} alt={cAuthor} className="w-6 h-6 rounded-full object-cover" />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                          {cAuthor.charAt(0)}
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">{cAuthor}</span>
                                          {!isString && isMyComment && (
                                            <div className="flex items-center gap-2">
                                              <button 
                                                onClick={() => {
                                                  const newText = window.prompt("Edit your comment:", cText);
                                                  if (newText && newText !== cText) {
                                                    handleEditComment(post.id, cId, newText);
                                                  }
                                                }}
                                                className="text-[10px] text-blue-500 hover:underline"
                                              >
                                                Edit
                                              </button>
                                              <button 
                                                onClick={() => {
                                                  if (window.confirm("Delete this comment?")) {
                                                    handleDeleteComment(post.id, cId);
                                                  }
                                                }}
                                                className="text-[10px] text-red-500 hover:underline"
                                              >
                                                Delete
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{displayText}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}`;

code = code.replace(oldRender, newRender);
fs.writeFileSync('src/App.tsx', code);
