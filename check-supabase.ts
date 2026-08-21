import { createClient } from "@supabase/supabase-js";
const url = "https://zsdaszwqwpjywmltlhps.supabase.co";
const key = "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(url, key);

async function testConn() {
  const { data, error } = await supabase.from('library_achiever_categories').insert({
    name: "Test Cat 2",
    description: "Test Desc",
    icon: "Award",
    display_order: 0,
    is_active: true
  }).select().single();
  console.log("Insert result:");
  console.log("Data:", data);
  console.log("Error:", error);
}
testConn();
