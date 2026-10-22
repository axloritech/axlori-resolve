/**
 * Supabase environment configuration.
 *
 * Both values are NEXT_PUBLIC_* and therefore visible to browsers by design.
 * That is safe: the anon key is constrained by Row Level Security.
 * The service-role key must NEVER appear here or anywhere client-reachable.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
