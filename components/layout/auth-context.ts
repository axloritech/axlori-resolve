import type { Role } from "@/types";

/**
 * What the app shell knows about identity. In live mode this is the verified
 * Supabase user (with role from the RLS-protected profiles table). In demo
 * modes it is nothing: the shell keeps using fictional demo personas, clearly
 * separated from any real account.
 */
export interface AuthContextInfo {
  /** Supabase env vars present. */
  configured: boolean;
  /** Verified session active (email confirmed). */
  live: boolean;
  /** Real name/email/role in live mode. */
  name?: string;
  email?: string;
  role?: Role;
  /** Show the "browsing in demo" banner (demo access while auth is enabled). */
  demoBanner: boolean;
}

export const DEMO_AUTH: AuthContextInfo = {
  configured: false,
  live: false,
  demoBanner: false,
};
