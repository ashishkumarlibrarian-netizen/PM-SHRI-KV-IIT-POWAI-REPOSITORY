import dotenv from "dotenv";
dotenv.config();

const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "sb_secret_LOt_hYVdVrFXe4ptcNH12A_3RIywl7e";
console.log("Key includes anon?", key.includes("anon"));
console.log("Token:", Buffer.from(key.split('.')[1] || '', 'base64').toString());
