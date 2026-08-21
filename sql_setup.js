const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
  // Read .env manually
  const env = fs.readFileSync('.env.example', 'utf-8').split('\n').reduce((acc, line) => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      acc[parts[0]] = parts.slice(1).join('=');
    }
    return acc;
  }, {});

  const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing keys");
    process.exit(1);
  }

  console.log("Supabase URL:", supabaseUrl);
  // We'll just edit server.ts instead.
}
run();
