const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleAddComment = \(postId: string\) => \{[\s\S]*?\n  \};/m;

const newHandleAddComment = `  const handleAddComment = async (postId: string) => {
    const commentText = commentInputMap[postId] || "";
    if (!commentText.trim()) return;

    const authorName = currentUser ? currentUser.fullName : "Guest Reader";
    const authorAvatar = currentUser ? currentUser.avatarUrl : "";

    setCommentInputMap((prev) => {
      const copy = { ...prev };
      delete copy[postId];
      return copy;
    });

    try {
      const res = await fetch(\`/api/social/posts/\${postId}/comment\`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText.trim(), authorName, authorAvatar }),
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPostCommentsMap((prev) => ({ ...prev, [postId]: updatedPost.comments || [] }));
        setSocialPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.error("Failed to save comment to server:", err);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(\`/api/social/posts/\${postId}/comment/\${commentId}\`, {
        method: "DELETE"
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPostCommentsMap((prev) => ({ ...prev, [postId]: updatedPost.comments || [] }));
        setSocialPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const handleEditComment = async (postId: string, commentId: string, newText: string) => {
    try {
      const res = await fetch(\`/api/social/posts/\${postId}/comment/\${commentId}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newText })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPostCommentsMap((prev) => ({ ...prev, [postId]: updatedPost.comments || [] }));
        setSocialPosts((prev) => prev.map((p) => (p.id === postId ? updatedPost : p)));
      }
    } catch (err) {
      console.error("Failed to edit comment:", err);
    }
  };`;

code = code.replace(regex, newHandleAddComment);
fs.writeFileSync('src/App.tsx', code);
