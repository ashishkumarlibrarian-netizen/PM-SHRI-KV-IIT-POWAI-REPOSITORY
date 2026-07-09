const dotenv = require('dotenv');
dotenv.config();

console.log("=== ENVIRONMENT KEYS ===");
for (const key of Object.keys(process.env)) {
  if (key.includes("SUPABASE")) {
    const val = process.env[key];
    console.log(`${key}: length=${val ? val.length : 0}, startsWith=${val ? val.substring(0, 15) : "N/A"}`);
  }
}
