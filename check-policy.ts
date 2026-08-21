import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('events').insert({
    id: "00000000-0000-0000-0000-000000000000",
    title: "Test",
    description: "Test"
  });
  console.log("Events insert:", data, error);
}
test();
