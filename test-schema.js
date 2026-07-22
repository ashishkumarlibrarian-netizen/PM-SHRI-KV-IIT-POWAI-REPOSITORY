import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql_statement: "SELECT column_name FROM information_schema.columns WHERE table_name = 'library_showcase_likes';" });
  console.log(data, error);
}
run();
