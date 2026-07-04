const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Change type of postCommentsMap
code = code.replace(
  `const [postCommentsMap, setPostCommentsMap] = useState<
    Record<string, string[]>
  >({});`,
  `const [postCommentsMap, setPostCommentsMap] = useState<
    Record<string, any[]>
  >({});`
);

code = code.replace(
  `const commentsMap: Record<string, string[]> = {};`,
  `const commentsMap: Record<string, any[]> = {};`
);

// 2. Change handleAddComment to use objects and real backend response
const oldHandleAddComment = `  const handleAddComment = (postId: string) => {
    const commentText = commentInputMap[postId] || "";
    if (!commentText.trim()) return;

    const studentName = currentUser ? currentUser.fullName : "Guest Reader";

    const key = postId;
    const existingComments = postCommentsMap[key] || [];
    const formattedComment = \`\${studentName}: \${commentText.trim()}\`;
    const updatedComments = [...existingComments, formattedComment];

    // Immediate UI response
    setPostCommentsMap((prev) => ({ ...prev, [key]: updatedComments }));

    setCommentInputMap((prev) => {
      const copy = { ...prev };
      delete copy[postId];
      return copy;
    });

    // Save to database
    fetch(\`/api/social/posts/\${postId}/comment\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment: formattedComment }),
    }).catch((err) => {
      console.error("Failed to save comment to server:", err);
    });
  };`;

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

    // Save to database
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
  };
`;

code = code.replace(oldHandleAddComment, newHandleAddComment);

// Write changes
fs.writeFileSync('src/App.tsx', code);
