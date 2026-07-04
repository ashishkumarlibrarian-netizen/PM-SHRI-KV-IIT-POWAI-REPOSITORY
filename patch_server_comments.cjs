const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCommentRoute = `// Add comment to a post
app.post("/api/social/posts/:id/comment", (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: "Comment content is required." });
    }

    const posts = readSocialPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (!post.comments) post.comments = [];
    post.comments.push(comment.trim());
    post.commentsCount = post.comments.length;

    writeSocialPosts(posts);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment." });
  }
});`;

const newCommentRoute = `// Add comment to a post
app.post("/api/social/posts/:id/comment", (req, res) => {
  try {
    const { id } = req.params;
    const { comment, authorName, authorAvatar } = req.body;
    if (!comment || (!comment.trim && !comment.text)) {
      return res.status(400).json({ error: "Comment content is required." });
    }

    const posts = readSocialPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (!post.comments) post.comments = [];
    const newComment = typeof comment === 'string' 
      ? { id: Date.now().toString() + Math.random(), text: comment.trim(), authorName: authorName || "Unknown", authorAvatar: authorAvatar || "" }
      : { id: Date.now().toString() + Math.random(), text: comment.text, authorName: comment.authorName || authorName || "Unknown", authorAvatar: comment.authorAvatar || authorAvatar || "" };
    
    post.comments.push(newComment);
    post.commentsCount = post.comments.length;

    writeSocialPosts(posts);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment." });
  }
});

app.delete("/api/social/posts/:postId/comment/:commentId", (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const posts = readSocialPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: "Post not found." });
    
    post.comments = (post.comments || []).filter(c => {
      if (typeof c === 'string') return false;
      return c.id !== commentId;
    });
    post.commentsCount = post.comments.length;
    
    writeSocialPosts(posts);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete comment." });
  }
});

app.put("/api/social/posts/:postId/comment/:commentId", (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const posts = readSocialPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return res.status(404).json({ error: "Post not found." });
    
    const comment = (post.comments || []).find(c => typeof c !== 'string' && c.id === commentId);
    if (comment) {
      comment.text = text;
    }
    
    writeSocialPosts(posts);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to edit comment." });
  }
});
`;

code = code.replace(oldCommentRoute, newCommentRoute);
fs.writeFileSync('server.ts', code);
