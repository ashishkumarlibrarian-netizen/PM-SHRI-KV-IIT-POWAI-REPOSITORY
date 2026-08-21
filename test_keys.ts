import dotenv from "dotenv";
dotenv.config();

console.log("URL matches?", process.env.VITE_SUPABASE_URL === process.env.VITE_SUPABASE_URL);
console.log("Anon key loaded?", !!process.env.VITE_SUPABASE_ANON_KEY);
console.log("Role key loaded?", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const roleStr = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
console.log("Role key contains 'anon'?", roleStr.includes("anon"));
console.log("Role key contains 'service_role'?", roleStr.includes("service_role"));

const tokenPayload = roleStr.split(".")[1];
if (tokenPayload) {
  const decoded = Buffer.from(tokenPayload, "base64").toString();
  console.log("Decoded role token:", decoded);
}
