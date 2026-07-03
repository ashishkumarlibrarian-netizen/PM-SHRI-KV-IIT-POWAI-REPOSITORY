const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldGrid = code.substring(
  code.indexOf('<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pb-2">'),
  code.indexOf('</div>\n                  </div>\n                </div>\n              </div>\n              {/* Main Feed Section */}')
);

// We replace the old grid with the new grid. We include the new links as a vertical list.

const newGrid = `<div className="grid grid-cols-1 gap-3 pb-2">
                    <a href="https://www.instagram.com/pmshri_kviitpowai_lib/" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-br from-pink-50/50 to-orange-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center">
                          <Instagram className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Instagram</span>
                          <span className="text-[10px] text-slate-500">Official Handle</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://www.youtube.com/@LibraryPoint1" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-br from-red-50/50 to-rose-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                          <Youtube className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">YouTube</span>
                          <span className="text-[10px] text-slate-500">Library Point</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://x.com/KVIITPowaiLib" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-br from-sky-50/50 to-blue-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          <Twitter className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">X / Twitter</span>
                          <span className="text-[10px] text-slate-500">Desk Feed</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://www.facebook.com/groups/712396956270837/" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <Facebook className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Facebook</span>
                          <span className="text-[10px] text-slate-500">Readers Group</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://creators.spotify.com/pod/profile/ashish-kumar496/" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 border border-emerald-200/60 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Radio className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Podcast</span>
                          <span className="text-[10px] text-slate-500">Spotify Creators</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://linktr.ee/librarykviitpowai" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-lime-50/50 to-green-50/20 border border-lime-200/60 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-800 flex items-center justify-center">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">LinkTr.ee</span>
                          <span className="text-[10px] text-slate-500">Universal Links</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>
                  </div>`;

code = code.replace(oldGrid, newGrid);

fs.writeFileSync('src/App.tsx', code);
