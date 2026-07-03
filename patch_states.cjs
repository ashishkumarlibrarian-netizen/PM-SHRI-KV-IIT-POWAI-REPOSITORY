const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  'const [newPostContent, setNewPostContent] = useState("");',
  `const [newPostContent, setNewPostContent] = useState("");
  const [reviewFilter, setReviewFilter] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");`
);

fs.writeFileSync('src/App.tsx', code);
