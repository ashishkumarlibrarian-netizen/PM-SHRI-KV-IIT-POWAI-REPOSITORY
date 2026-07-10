const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = "https://zsdaszwqwpjywmltlhps.supabase.co";
const supabaseKey = "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(supabaseUrl, supabaseKey);
supabase.rpc('exec', { query: 'CREATE TABLE fake (id int);' }).then(console.log).catch(console.error);
