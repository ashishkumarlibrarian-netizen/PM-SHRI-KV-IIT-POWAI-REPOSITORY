import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.rpc('execute_sql', { sql_statement: "SELECT * FROM pg_policies WHERE tablename IN ('quick_links', 'library_achiever_categories')" });
  console.log(data);
}
run();
