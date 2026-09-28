import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isBackendSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabaseServer = isBackendSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;
