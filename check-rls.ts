import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.VITE_SUPABASE_URL || "https://zsdaszwqwpjywmltlhps.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('events').select('*').limit(1);
  console.log("events:", data);
}
check();
