const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://zsdaszwqwpjywmltlhps.supabase.co";
const supabaseKey = "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(supabaseUrl, supabaseKey);
supabase.from('social_posts').insert({
  id: "00000000-0000-0000-0000-000000000002",
  student_name: "Test",
  class_name: "10A",
  avatar_seed: "seed",
  book_title: "Book",
  content: "Content"
}).select().then(r => console.log(JSON.stringify(r))).catch(console.error);
