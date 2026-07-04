const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeTab.tsx', 'utf8');

const oldBtn = `<button
                onClick={() => setActiveTab("books")}
                className="px-6 py-3 bg-white/10 dark:bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 transition-all inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Explore Recent Books
              </button>`;

const newBtn = `<a
                href="https://eg4.nic.in/OPAC/Default.aspx?CL_NAME=KVS3"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-white/10 dark:bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl border border-white/20 transition-all inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> Explore Recent Books
              </a>`;

code = code.replace(oldBtn, newBtn);
fs.writeFileSync('src/components/WelcomeTab.tsx', code);
