const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeTab.tsx', 'utf8');

// The original "Premium Thought of the Day Card" block in the hero image.
const oldHeroThoughtCard = `            {/* Premium Thought of the Day Card */}
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
            </div>`;

code = code.replace(oldHeroThoughtCard, ""); // Remove from hero banner

// Define the new standalone card
const newStandaloneThoughtCard = `      {/* Thought of the Day - Premium Standalone Card */}
      <motion.div variants={itemVariants} className="w-full">
        <div className={\`w-full \${thoughtOfTheDay?.bg_color || 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'} backdrop-blur-xl rounded-2xl p-8 border \${thoughtOfTheDay?.border_color || 'border-amber-500/30'} relative overflow-hidden group hover:\${thoughtOfTheDay?.border_color?.replace('/30', '/60') || 'border-amber-500/60'} transition-all shadow-sm hover:shadow-md\`}>
          {/* Animated Accent Bar / Gradient Overlay */}
          <div className={\`absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b \${thoughtOfTheDay?.gradient_start || 'from-amber-400'} \${thoughtOfTheDay?.gradient_end || 'to-amber-600'} shadow-[0_0_10px_rgba(245,158,11,0.5)]\`}></div>
          <div className={\`absolute top-0 right-0 w-64 h-full bg-gradient-to-l \${thoughtOfTheDay?.gradient_start || 'from-amber-500/10'} to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500\`}></div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            {/* Header/Icon Side */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <div className={\`flex items-center gap-2 text-xs font-bold uppercase tracking-widest \${thoughtOfTheDay?.text_color || 'text-amber-400'}\`}>
                 <span className="text-xl">{thoughtOfTheDay?.icon || '✨'}</span> {thoughtOfTheDay?.title || 'Thought of the Day'}
              </div>
              <div className="w-12 h-1 rounded-full bg-current opacity-20"></div>
            </div>
            
            {/* Content Side */}
            <div className="flex-1 border-l border-current/10 pl-6 py-2">
              <p className={\`text-lg md:text-xl italic font-medium leading-relaxed \${thoughtOfTheDay?.text_color ? 'text-current opacity-90' : 'text-slate-200'}\`}>
                "{thoughtOfTheDay?.thought || 'Reading is the passport to countless adventures.'}"
              </p>
              <p className={\`text-sm font-semibold mt-4 flex items-center gap-2 \${thoughtOfTheDay?.text_color ? 'text-current opacity-70' : 'text-slate-400'}\`}>
                <span className="w-4 h-[1px] bg-current opacity-50"></span>
                {thoughtOfTheDay?.author || 'PM Shri KV IIT Powai Library'}
              </p>
            </div>
          </div>

          {/* Large Background Quote */}
          <div className="absolute -bottom-8 -right-4 text-[12rem] font-serif leading-none opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700 select-none pointer-events-none">
            "
          </div>
        </div>
      </motion.div>
`;

// Insert it right before the Library Stats Board
code = code.replace(
  "{/* Library Stats Board */}",
  newStandaloneThoughtCard + "\n      {/* Library Stats Board */}"
);

fs.writeFileSync('src/components/WelcomeTab.tsx', code);
