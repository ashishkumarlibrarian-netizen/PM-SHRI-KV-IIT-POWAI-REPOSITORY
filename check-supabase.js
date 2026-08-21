const { createClient } = require("@supabase/supabase-js");
const url = process.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(url, key);

async function testConn() {
  const { data, error } = await supabase.from('library_achiever_categories').insert({
    name: "Test",
    display_order: 1,
    is_active: true
  }).select().single();
  console.log("Insert result:", data, error);
}

testConn();
