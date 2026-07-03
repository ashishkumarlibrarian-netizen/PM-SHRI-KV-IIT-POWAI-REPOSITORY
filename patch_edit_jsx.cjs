const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const postContentRender = '<p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">\n                              {post.content}\n                            </p>';

const editableContentRender = `{editingPostId === post.id ? (
                              <div className="space-y-2 mt-2">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-sky-500 min-h-[80px]"
                                />
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => setEditingPostId(null)} className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700">Cancel</button>
                                  <button onClick={() => handleSaveEdit(post.id)} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-colors shadow">Save Changes</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {post.content}
                              </p>
                            )}`;

if (code.includes(postContentRender)) {
  code = code.replace(postContentRender, editableContentRender);
  fs.writeFileSync('src/App.tsx', code);
} else {
  console.log("Not found!");
}
