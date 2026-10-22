import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Server-side Supabase client bound to the request cookie store.
 * Works in Server Components (read-only cookies) and Route Handlers /
 * Server Actions (writable cookies), following the @supabase/ssr pattern.
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component where cookies are read-only. The
          // middleware refresh keeps sessions alive, so this is safe to skip.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Same Server Component limitation as above.
        }
      },
    },
  });
}
