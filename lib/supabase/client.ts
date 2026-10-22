"use client";

import { createBrowserClient } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Browser-side Supabase client (@supabase/ssr). Sessions are synced to
 * cookies so server components and middleware can read them.
 * Only import this from client components.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
