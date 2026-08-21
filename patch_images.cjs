const fs = require('fs');
let content = fs.readFileSync('src/components/LibraryAchieversManager.tsx', 'utf-8');

content = content.replace(
  '<img src={ach.profile_photo} alt={ach.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" />',
  '<img src={ach.profile_photo} alt={ach.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=\${encodeURIComponent(ach.name)}&background=random`; }} />'
);

content = content.replace(
  '<img src={editingAchiever.profile_photo} alt="Profile" className="w-full h-full object-cover" />',
  '<img src={editingAchiever.profile_photo} alt="Profile" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=\${encodeURIComponent(editingAchiever.name || "A")}&background=random`; }} />'
);

fs.writeFileSync('src/components/LibraryAchieversManager.tsx', content);

let contentTab = fs.readFileSync('src/components/LibraryAchieversTab.tsx', 'utf-8');
contentTab = contentTab.replace(
  '<img src={achiever.profile_photo} alt={achiever.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />',
  '<img src={achiever.profile_photo} alt={achiever.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=\${encodeURIComponent(achiever.name)}&background=random`; }} />'
);
fs.writeFileSync('src/components/LibraryAchieversTab.tsx', contentTab);
