const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://zsdaszwqwpjywmltlhps.supabase.co";
const supabaseKey = "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(supabaseUrl, supabaseKey);
Promise.all([
  supabase.from('profiles').select('*').limit(1),
  supabase.from('thoughts').select('*').limit(1)
]).then(r => console.log(JSON.stringify(r))).catch(console.error);
