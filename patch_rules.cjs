const fs = require('fs');
let code = fs.readFileSync('src/components/WelcomeTab.tsx', 'utf8');

const newRulesCard = `
      {/* 📚 Library Rules */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Book className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">📚 Library Rules</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: Users, text: "All students of the school are members of the library." },
            { icon: BookOpen, text: "A student can borrow only two books at a time for a period of one week." },
            { icon: Clock, text: "Books will be issued to the students during the library periods. No book will be issued or returned during teaching hours." },
            { icon: Edit3, text: "Marking, underlining or writing on library books is strictly forbidden." },
            { icon: Lock, text: "Reference books and current periodicals will not be issued to any student. These may be consulted only inside the library." },
            { icon: AlertCircle, text: "Books not returned within the prescribed period shall attract a fine as per library rules." },
            { icon: Bell, text: "The Librarian reserves the right to recall any book at any time, even before the due date." },
            { icon: IndianRupee, text: "In case of loss of a library book, the borrower must either replace the same book or deposit its current market price." },
            { icon: FileText, text: "Every student must obtain a \\"No Dues Certificate\\" from the Library before leaving or withdrawing from the school." },
            { icon: Shield, text: "Strict discipline, silence and proper library etiquette must always be maintained." }
          ].map((rule, idx) => (
             <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-amber-500/30 transition-colors group">
               <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-sm text-slate-500 dark:text-slate-400 group-hover:text-amber-500 transition-colors">
                 <rule.icon className="w-5 h-5" />
               </div>
               <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium mt-1">{idx + 1}. {rule.text}</p>
             </div>
          ))}
        </div>
      </motion.div>
`;

code = code.replace('{/* Librarian Profile and Welcome Message */}', newRulesCard + '\n      {/* Librarian Profile and Welcome Message */}');

// Make sure icons are imported
const iconsToAdd = ['Book', 'Users', 'BookOpen', 'Clock', 'Edit3', 'Lock', 'AlertCircle', 'Bell', 'IndianRupee', 'FileText', 'Shield'];
const importLineMatch = code.match(/import \{([^}]+)\} from 'lucide-react'/);
if (importLineMatch) {
  let existingIcons = importLineMatch[1].split(',').map(s => s.trim());
  let neededIcons = iconsToAdd.filter(i => !existingIcons.includes(i));
  if (neededIcons.length > 0) {
    code = code.replace(/import \{([^}]+)\} from 'lucide-react'/, `import { $1, ${neededIcons.join(', ')} } from 'lucide-react'`);
  }
}

fs.writeFileSync('src/components/WelcomeTab.tsx', code);
