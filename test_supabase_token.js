const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log("Key is anon?", key.includes("anon"));
const payload = key.split('.')[1];
console.log("Token:", Buffer.from(payload, 'base64').toString());

