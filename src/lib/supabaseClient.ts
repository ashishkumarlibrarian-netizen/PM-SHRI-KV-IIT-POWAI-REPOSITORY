import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zsdaszwqwpjywmltlhps.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_G-mVD5fxJ-79UHgE-DWdZw_rA_2eMnI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
