// ── supabase ──────────────────────────────────────────────────────────
// Supabase client instance — import นี้ทุกที่ที่ต้องการ query DB หรือ Auth

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
