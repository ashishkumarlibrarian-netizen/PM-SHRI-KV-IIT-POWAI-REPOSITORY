const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-none">',
  '<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pb-2">'
);

code = code.replace(
  '<div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start p-4 bg-gradient-to-br from-pink-50/50 to-orange-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4 group/item">',
  '<div className="p-4 bg-gradient-to-br from-pink-50/50 to-orange-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4 group/item">'
);
code = code.replace(
  '<div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start p-4 bg-gradient-to-br from-red-50/50 to-rose-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4">',
  '<div className="p-4 bg-gradient-to-br from-red-50/50 to-rose-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4">'
);
code = code.replace(
  '<div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start p-4 bg-gradient-to-br from-sky-50/50 to-blue-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4">',
  '<div className="p-4 bg-gradient-to-br from-sky-50/50 to-blue-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4">'
);
code = code.replace(
  '<div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4">',
  '<div className="p-4 bg-gradient-to-br from-blue-50/50 to-indigo-50/20 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col justify-between gap-4">'
);
code = code.replace(
  '<div className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl flex flex-col justify-between gap-4">',
  '<div className="p-4 bg-gradient-to-br from-amber-50/50 to-orange-50/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl flex flex-col justify-between gap-4 col-span-1 md:col-span-2 lg:col-span-2">'
);

fs.writeFileSync('src/App.tsx', code);
