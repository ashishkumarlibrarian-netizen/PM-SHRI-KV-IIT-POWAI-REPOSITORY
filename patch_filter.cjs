const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const filterCode = `
                      <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => setReviewFilter(null)} className={\`px-3 py-1.5 rounded-full text-xs font-bold \${!reviewFilter ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'} transition-colors\`}>All Reviews</button>
                        {[5,4,3,2,1].map(stars => (
                          <button key={stars} onClick={() => setReviewFilter(stars)} className={\`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 \${reviewFilter === stars ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'} transition-colors\`}>
                            {stars} <span className="text-amber-500">★</span>
                          </button>
                        ))}
                      </div>
`;

code = code.replace(
  `{socialPosts.length === 0 ? (`,
  filterCode + `\n                    {socialPosts.length === 0 ? (`
);

const filteredVar = `
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const filteredPosts = reviewFilter ? socialPosts.filter(p => p.rating === reviewFilter) : socialPosts;
`;

code = code.replace(
  'const handleLikePost', 
  filteredVar + '\n  const handleLikePost'
);

code = code.replace(
  'socialPosts.map((post) => {',
  'filteredPosts.map((post) => {'
);
code = code.replace(
  '{socialPosts.length === 0 ? (',
  '{filteredPosts.length === 0 ? ('
);

fs.writeFileSync('src/App.tsx', code);
