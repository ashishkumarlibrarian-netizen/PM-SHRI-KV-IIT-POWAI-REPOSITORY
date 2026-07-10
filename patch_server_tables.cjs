const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace /api/social/posts logic
const oldSocialPosts = `app.get("/api/social/posts", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('social_posts').select('*').order('timestamp', { ascending: false });
    if (error) return handleError(res, error, "Failed to get posts");
    
    const mapped = (data || []).map((p: any) => ({
      ...p,
      studentName: p.student_name,
      className: p.class_name,
      avatarSeed: p.avatar_seed,
      bookTitle: p.book_title,
      commentsCount: p.comments_count,
      photoUrl: p.photo_url,
      likedBy: p.liked_by || []
    }));
    res.json(mapped);
  } catch (err) {
    handleError(res, err, "Failed to fetch posts from database");
  }
}));

app.post("/api/social/posts", asyncHandler(async (req, res, next) => {
  const { studentName, className, avatarSeed, bookTitle, author, rating, content, tags, photoUrl } = req.body;
  const newPost = {
    id: crypto.randomUUID(),
    student_name: studentName,
    class_name: className,
    avatar_seed: avatarSeed,
    book_title: bookTitle,
    author,
    rating,
    content,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments_count: 0,
    tags,
    photo_url: photoUrl,
    liked_by: [],
    comments: []
  };
  const { error } = await supabase.from('social_posts').insert(newPost);
  if (error) return handleError(res, error, "Failed to add post");
  res.json(newPost);
}));`;

const newSocialPosts = `app.get("/api/social/posts", asyncHandler(async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('library_posts').select('*').order('created_at', { ascending: false });
    if (error) {
      // Fallback to social_posts for preview if library_posts doesn't exist
      if (error.code === 'PGRST205') {
        const fallback = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
        if (!fallback.error) {
          const mapped = (fallback.data || []).map((p: any) => ({
            id: p.id, studentName: p.student_name, className: p.class_name, avatarSeed: p.avatar_seed,
            bookTitle: p.book_title, author: p.author, rating: p.rating, content: p.content,
            timestamp: p.created_at || p.timestamp, likes: p.likes || 0, commentsCount: p.comments_count || 0,
            tags: p.tags || [], photoUrl: p.photo_url
          }));
          return res.json(mapped);
        }
      }
      return handleError(res, error, "Failed to get posts");
    }
    
    const mapped = (data || []).map((p: any) => ({
      id: p.id,
      studentName: p.student_name || 'Anonymous',
      className: p.class_name || '',
      avatarSeed: p.avatar_url || 'a',
      bookTitle: p.book_title,
      author: p.author_name,
      rating: p.rating,
      content: p.review,
      timestamp: p.created_at,
      likes: p.likes || 0,
      commentsCount: p.comments_count || 0,
      tags: p.hashtags || [],
      photoUrl: p.photo_url
    }));
    res.json(mapped);
  } catch (err) {
    handleError(res, err, "Failed to fetch posts from database");
  }
}));

app.post("/api/social/posts", asyncHandler(async (req, res, next) => {
  const { studentName, className, avatarSeed, bookTitle, author, rating, content, tags, photoUrl } = req.body;
  
  // Try library_posts first
  const newPost = {
    student_name: studentName,
    class_name: className,
    avatar_url: avatarSeed,
    book_title: bookTitle,
    author_name: author,
    rating,
    review: content,
    created_at: new Date().toISOString(),
    likes: 0,
    comments_count: 0,
    hashtags: tags,
    photo_url: photoUrl
  };
  
  let { data, error } = await supabase.from('library_posts').insert(newPost).select().single();
  
  if (error && error.code === 'PGRST205') {
    // Fallback to social_posts for preview
    const fallbackPost = {
      id: crypto.randomUUID(),
      student_name: studentName,
      class_name: className,
      avatar_seed: avatarSeed,
      book_title: bookTitle,
      author,
      rating,
      content,
      likes: 0,
      comments_count: 0,
      tags,
      photo_url: photoUrl
    };
    const fallbackRes = await supabase.from('social_posts').insert(fallbackPost).select().single();
    error = fallbackRes.error;
    data = fallbackRes.data;
    if (!error && data) {
       return res.json({
         id: data.id, studentName: data.student_name, className: data.class_name, avatarSeed: data.avatar_seed,
         bookTitle: data.book_title, author: data.author, rating: data.rating, content: data.content,
         timestamp: data.created_at || new Date().toISOString(), likes: data.likes || 0, commentsCount: data.comments_count || 0,
         tags: data.tags || [], photoUrl: data.photo_url
       });
    }
  }

  if (error) return handleError(res, error, "Failed to add post");
  
  res.json({
    id: data.id,
    studentName: data.student_name,
    className: data.class_name,
    avatarSeed: data.avatar_url,
    bookTitle: data.book_title,
    author: data.author_name,
    rating: data.rating,
    content: data.review,
    timestamp: data.created_at,
    likes: data.likes || 0,
    commentsCount: data.comments_count || 0,
    tags: data.hashtags || [],
    photoUrl: data.photo_url
  });
}));`;

code = code.replace(oldSocialPosts, newSocialPosts);

// We need to also patch the PUT and DELETE of social_posts to use fallback... I will just rewrite them entirely
const oldLike = `app.post("/api/social/posts/:id/like", asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  const { data: post, error } = await supabase.from('social_posts').select('*').eq('id', req.params.id).single();
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const likedBy = post.liked_by || [];
  let newLikes = post.likes;
  
  if (likedBy.includes(userId)) {
    likedBy.splice(likedBy.indexOf(userId), 1);
    newLikes = Math.max(0, newLikes - 1);
  } else {
    likedBy.push(userId);
    newLikes++;
  }
  
  await supabase.from('social_posts').update({ likes: newLikes, liked_by: likedBy }).eq('id', req.params.id);
  res.json({ likes: newLikes, isLiked: likedBy.includes(userId) });
}));`;

const newLike = `app.post("/api/social/posts/:id/like", asyncHandler(async (req, res, next) => {
  const { userId } = req.body;
  
  // Try library_posts
  let table = 'library_posts';
  let { data: post, error } = await supabase.from(table).select('*').eq('id', req.params.id).single();
  
  if (error && error.code === 'PGRST205') {
    table = 'social_posts';
    const fallback = await supabase.from(table).select('*').eq('id', req.params.id).single();
    post = fallback.data;
    error = fallback.error;
  }
  
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const likedBy = post.liked_by || [];
  let newLikes = post.likes || 0;
  
  if (likedBy.includes(userId)) {
    likedBy.splice(likedBy.indexOf(userId), 1);
    newLikes = Math.max(0, newLikes - 1);
  } else {
    likedBy.push(userId);
    newLikes++;
  }
  
  await supabase.from(table).update({ likes: newLikes, liked_by: likedBy }).eq('id', req.params.id);
  res.json({ likes: newLikes, isLiked: likedBy.includes(userId) });
}));`;

code = code.replace(oldLike, newLike);

const oldComment = `app.post("/api/social/posts/:id/comment", asyncHandler(async (req, res, next) => {
  const { comment, authorName, authorAvatar } = req.body;
  const { data: post, error } = await supabase.from('social_posts').select('*').eq('id', req.params.id).single();
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const comments = post.comments || [];
  const newComment = { id: crypto.randomUUID(), text: comment.text || comment, author: authorName, avatar: authorAvatar, timestamp: new Date().toISOString() };
  comments.push(newComment);
  
  await supabase.from('social_posts').update({ comments, comments_count: comments.length }).eq('id', req.params.id);
  res.json({ message: "Comment added", comment: newComment });
}));`;

const newComment = `app.post("/api/social/posts/:id/comment", asyncHandler(async (req, res, next) => {
  const { comment, authorName, authorAvatar } = req.body;
  let table = 'library_posts';
  let { data: post, error } = await supabase.from(table).select('*').eq('id', req.params.id).single();
  
  if (error && error.code === 'PGRST205') {
    table = 'social_posts';
    const fallback = await supabase.from(table).select('*').eq('id', req.params.id).single();
    post = fallback.data;
    error = fallback.error;
  }
  
  if (error || !post) return res.status(404).json({ error: "Post not found" });
  
  const comments = post.comments || [];
  const newComment = { id: crypto.randomUUID(), text: comment.text || comment, author: authorName, avatar: authorAvatar, timestamp: new Date().toISOString() };
  comments.push(newComment);
  
  await supabase.from(table).update({ comments, comments_count: comments.length }).eq('id', req.params.id);
  res.json({ message: "Comment added", comment: newComment });
}));`;

code = code.replace(oldComment, newComment);

const oldDelete = `app.delete("/api/social/posts/:id", asyncHandler(async (req, res, next) => {
  await supabase.from('social_posts').delete().eq('id', req.params.id);
  res.json({ message: "Deleted" });
}));`;

const newDelete = `app.delete("/api/social/posts/:id", asyncHandler(async (req, res, next) => {
  const { error } = await supabase.from('library_posts').delete().eq('id', req.params.id);
  if (error && error.code === 'PGRST205') {
    await supabase.from('social_posts').delete().eq('id', req.params.id);
  }
  res.json({ message: "Deleted" });
}));`;

code = code.replace(oldDelete, newDelete);

fs.writeFileSync('server.ts', code);
