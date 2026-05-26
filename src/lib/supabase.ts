import { createClient } from '@supabase/supabase-js';

function getEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  return { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey };
}

export function getSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnv();
  return createClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabaseAdminClient() {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = getEnv();
  if (!supabaseServiceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
        'This is required for server-side operations.'
    );
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
}
