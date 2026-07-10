const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeTab.tsx', 'utf8');

// First check if thoughtOfTheDay state exists. If not, add it.
if (!code.includes('const [thoughtOfTheDay')) {
  code = code.replace(
    'export default function WelcomeTab({ currentUser, onNavigateToAIStories }: { currentUser: any; onNavigateToAIStories?: () => void }) {',
    `export default function WelcomeTab({ currentUser, onNavigateToAIStories }: { currentUser: any; onNavigateToAIStories?: () => void }) {
  const [thoughtOfTheDay, setThoughtOfTheDay] = React.useState<any>(null);
  
  React.useEffect(() => {
    fetch('/api/thoughts').then(res => {
      if (res.ok) return res.json();
      return null;
    }).then(data => {
      if (data && data.length > 0) setThoughtOfTheDay(data[0]);
    }).catch(console.error);
  }, []);`
  );
  
  // also handle the case where onNavigateToAIStories was not there in the signature
  code = code.replace(
    'export default function WelcomeTab({ currentUser }: { currentUser: any }) {',
    `export default function WelcomeTab({ currentUser }: { currentUser: any }) {
  const [thoughtOfTheDay, setThoughtOfTheDay] = React.useState<any>(null);
  
  React.useEffect(() => {
    fetch('/api/thoughts').then(res => {
      if (res.ok) return res.json();
      return null;
    }).then(data => {
      if (data && data.length > 0) setThoughtOfTheDay(data[0]);
    }).catch(console.error);
  }, []);`
  );
}

const openTodayBlock = `          <div className="hidden lg:block w-72 h-44 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative">
            {isOpenToday ? (
              <div className="absolute top-4 right-4 text-emerald-400 flex items-center gap-1.5 text-xs font-semibold bg-emerald-950/50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Open Today
              </div>
            ) : (
              <div className="absolute top-4 right-4 text-rose-400 flex items-center gap-1.5 text-xs font-semibold bg-rose-950/50 px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span> Closed Now
              </div>
            )}
            <div className="mt-2 space-y-4 text-xs font-mono">
              <div className="text-amber-300 uppercase tracking-widest text-center border-b border-white/10 pb-2">Vidyalaya Hours</div>
              <div className="flex flex-col text-white gap-1 items-center">
                <span className="text-slate-300">Monday - Saturday</span>
                <span className="font-semibold">07:00 AM - 02:00 PM</span>
              </div>
              <div className="flex flex-col text-slate-400 gap-1 items-center">
                <span className="text-slate-500">Sundays & Holidays</span>
                <span className="font-semibold">Closed</span>
              </div>
            </div>
          </div>`;

const newCardsLayout = `          <div className="hidden lg:flex gap-4">
${openTodayBlock}

            {/* Premium Thought of the Day Card */}
            <div className="w-80 h-44 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/60 transition-all shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]">
              {/* Animated left accent bar */}
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
              
              <div className="absolute top-4 left-5 text-amber-400 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                 <BookOpen className="w-3.5 h-3.5 text-amber-500" /> Thought of the Day
              </div>
              
              {/* Quote Icon Background */}
              <div className="absolute -bottom-4 -right-2 text-amber-500/10 group-hover:scale-110 transition-transform duration-500">
                <span className="text-8xl font-serif">"</span>
              </div>

              {thoughtOfTheDay ? (
                <div className="mt-7 flex flex-col justify-center h-[calc(100%-2rem)]">
                  <p className="text-white/95 text-sm italic font-medium leading-snug line-clamp-3">
                    "{thoughtOfTheDay.thought}"
                  </p>
                  <p className="text-slate-300 text-xs font-semibold mt-2 text-right">
                    — {thoughtOfTheDay.author}
                  </p>
                </div>
              ) : (
                <div className="mt-7 flex flex-col justify-center h-[calc(100%-2rem)]">
                  <p className="text-white/95 text-sm italic font-medium leading-snug line-clamp-3">
                    "Welcome to PM SHRI KV IIT Powai Library."
                  </p>
                </div>
              )}
            </div>
          </div>`;

code = code.replace(openTodayBlock, newCardsLayout);

fs.writeFileSync('src/components/WelcomeTab.tsx', code);
