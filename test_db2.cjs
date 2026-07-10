const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://zsdaszwqwpjywmltlhps.supabase.co";
const supabaseKey = "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('social_posts').insert({
  id: "00000000-0000-0000-0000-000000000001",
  student_name: "T",
  class_name: "X",
  avatar_seed: "a",
  book_title: "a",
  author: "a",
  rating: 5,
  content: "c",
  timestamp: new Date().toISOString(),
  tags: [],
  photo_url: null,
  liked_by: [],
  likes: 0
}).then(r => console.log(JSON.stringify(r))).catch(console.error);
