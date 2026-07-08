const fs = require('fs');

let code = fs.readFileSync('server.ts', 'utf-8');
const oldRoute = `app.get("/api/social/posts", async (req, res) => {
  const { data, error } = await supabase.from('social_posts').select('*').order('timestamp', { ascending: false });
  if (error) return handleError(res, error, "Failed to get posts");
  
  const mapped = data.map((p: any) => ({
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
});`;

const newRoute = `app.get("/api/social/posts", async (req, res) => {
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
});`;

code = code.replace(oldRoute, newRoute);
fs.writeFileSync('server.ts', code);
