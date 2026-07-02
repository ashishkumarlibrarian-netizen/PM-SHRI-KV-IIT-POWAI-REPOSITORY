const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newRoutes = `
// Delete a post
app.delete("/api/social/posts/:id", (req, res) => {
  try {
    const { id } = req.params;
    const posts = readSocialPosts();
    const updated = posts.filter(p => p.id !== id);
    writeSocialPosts(updated);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Edit a post
app.put("/api/social/posts/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;
    const posts = readSocialPosts();
    const post = posts.find(p => p.id === id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    post.content = content || post.content;
    post.rating = rating !== undefined ? rating : post.rating;
    writeSocialPosts(posts);
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to edit post" });
  }
});
`;

code = code.replace(
  '// Toggle post like count',
  newRoutes + '\n// Toggle post like count'
);

fs.writeFileSync('server.ts', code);
