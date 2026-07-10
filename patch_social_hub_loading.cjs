const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [isPosting, setIsPosting] =')) {
  code = code.replace(
    'const [newPostTags, setNewPostTags] = useState("");',
    'const [newPostTags, setNewPostTags] = useState("");\n  const [isPosting, setIsPosting] = useState(false);\n  const [postError, setPostError] = useState("");'
  );
  
  const oldHandle = `  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostBookTitle.trim()) return;

    const tagsArray = newPostTags
      ? newPostTags.split(",").map((t) => t.trim().replace(/^#/, ""))
      : ["KVPowaiReads"];

    fetch("/api/social/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: studentName.trim() || "Young Scholar",
        className: studentClass || "Class X-A",
        bookTitle: newPostBookTitle.trim(),
        author: newPostAuthor.trim() || "Unknown Author",
        rating: newPostRating,
        content: newPostContent.trim(),
        tags: tagsArray,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to create post");
      })
      .then((createdPost) => {
        setSocialPosts((prev) => [createdPost, ...prev]);
        setNewPostContent("");
        setNewPostBookTitle("");
        setNewPostAuthor("");
        setNewPostTags("");
      })
      .catch((err) => {
        console.error("Failed to post: ", err);
      });
  };`;

  const newHandle = `  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !newPostBookTitle.trim()) return;

    const tagsArray = newPostTags
      ? newPostTags.split(",").map((t) => t.trim().replace(/^#/, ""))
      : ["KVPowaiReads"];

    setIsPosting(true);
    setPostError("");

    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName.trim() || "Young Scholar",
          className: studentClass || "Class X-A",
          avatarSeed: currentUser?.avatarUrl,
          photoUrl: currentUser?.avatarUrl,
          bookTitle: newPostBookTitle.trim(),
          author: newPostAuthor.trim() || "Unknown Author",
          rating: newPostRating,
          content: newPostContent.trim(),
          tags: tagsArray,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || "Failed to create post");
      
      setSocialPosts((prev) => [data, ...prev]);
      setNewPostContent("");
      setNewPostBookTitle("");
      setNewPostAuthor("");
      setNewPostTags("");
      
      // Auto-refresh the feed just in case
      const refreshRes = await fetch("/api/social/posts");
      if (refreshRes.ok) setSocialPosts(await refreshRes.json());
      
    } catch (err: any) {
      console.error("Failed to post: ", err);
      setPostError(err.message || "Failed to post");
    } finally {
      setIsPosting(false);
    }
  };`;
  
  code = code.replace(oldHandle, newHandle);
  
  const oldButton = `                      <button
                        type="submit"
                        className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" /> Broadcast to School Library
                        Wall
                      </button>`;
                      
  const newButton = `                      {postError && (
                        <div className="p-3 rounded-lg bg-red-50 text-red-600 border border-red-200 text-sm">
                          {postError}
                        </div>
                      )}
                      <button
                        type="submit"
                        disabled={isPosting}
                        className="w-full py-3 bg-red-800 hover:bg-red-900 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPosting ? <span className="animate-spin">⏳</span> : <Send className="w-5 h-5" />}
                        {isPosting ? "Posting..." : "Broadcast to School Library Wall"}
                      </button>`;
                      
  code = code.replace(oldButton, newButton);
  fs.writeFileSync('src/App.tsx', code);
}
