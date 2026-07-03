const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pb-2">';
const endStr = '{/* Simulated Feed Posts */}';

const startIndex = code.indexOf(startStr);
const endIndex = code.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find start or end index", startIndex, endIndex);
  process.exit(1);
}

// walk back endIndex to the first </div> that precedes it at the correct level
const preEndStr = '</div>\n                  </div>\n                </div>\n              </div>\n              ' + endStr;
const actualEndIndex = code.indexOf(preEndStr);

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

                    <a href="https://padlet.com/ashishkumar_librarian/kv-iit-powai-library-book-review-s9f81r6e8c7rnh1p" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-br from-yellow-50/50 to-amber-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Padlet</span>
                          <span className="text-[10px] text-slate-500">Book Reviews</span>
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
                          <span className="text-[10px] text-slate-500">KV IIT LIBRARY</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://linktr.ee/kviitpowailibrary" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/20 border border-emerald-200/60 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Share2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">LinkTr.ee</span>
                          <span className="text-[10px] text-slate-500">Universal Links</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://soundcloud.com/pmshri-kv-iit-library" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-orange-50/50 to-red-50/20 border border-orange-200/60 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Soundcloud</span>
                          <span className="text-[10px] text-slate-500">Audio Library</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://wakelet.com/@PMSHRIKVIITPowaiLibrary" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-blue-50/50 to-cyan-50/20 border border-blue-200/60 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Bookmark className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">Wakelet</span>
                          <span className="text-[10px] text-slate-500">Curated Collections</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://www.linkedin.com/in/p-m-shri-k-v-iit-powai-library-b6a12a326/" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/20 border border-blue-200/60 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                          <Linkedin className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">LinkedIn</span>
                          <span className="text-[10px] text-slate-500">Professional Network</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></span>
                    </a>

                    <a href="https://eg4.nic.in/OPAC/Default.aspx?CL_NAME=KVS3" target="_blank" rel="noopener noreferrer" className="p-4 bg-gradient-to-r from-purple-50/50 to-fuchsia-50/20 border border-purple-200/60 rounded-2xl flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                          <Search className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">WEB OPAC</span>
                          <span className="text-[10px] text-slate-500">Catalog Search</span>
                        </div>
                      </div>
                      <span className="px-3 py-1.5 bg-purple-600 text-white text-[11px] font-semibold rounded-lg flex items-center gap-1">Search <ExternalLink className="w-3 h-3" /></span>
                    </a>
                  </div>
                </div>
              </div>
              `;

let finalEndIndex = actualEndIndex;
if (actualEndIndex === -1) {
  finalEndIndex = endIndex;
  console.log("fallback");
}

code = code.substring(0, startIndex) + newGrid + code.substring(finalEndIndex);
fs.writeFileSync('src/App.tsx', code);
