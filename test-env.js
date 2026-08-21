import dotenv from 'dotenv';
dotenv.config();
console.log("VITE_SUPABASE_URL is set:", !!process.env.VITE_SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY is set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
