import { cookies } from "next/headers";
import type { ReactNode } from "react";

import SessionPolicy from "@/components/auth/SessionPolicy";
import AppShell from "@/components/layout/AppShell";
import { DEMO_AUTH, type AuthContextInfo } from "@/components/layout/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Role } from "@/types";

/**
 * Application shell layout. Resolves identity server-side:
 *  - verified session -> live mode (real name/role from profiles, sign out,
 *    demo role switcher removed so it cannot pretend to grant privileges);
 *  - demo cookie -> demo banner mode;
 *  - no Supabase -> unchanged pure-frontend demo.
 */
export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  let auth: AuthContextInfo = DEMO_AUTH;

  if (isSupabaseConfigured()) {
    const demoCookie = cookies().get("axlori_demo")?.value === "1";
    try {
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && (user as { email_confirmed_at?: string }).email_confirmed_at) {
        let name = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "User";
        let role: Role = "student";
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name,role")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.full_name) name = profile.full_name;
          if (profile?.role === "staff" || profile?.role === "admin" || profile?.role === "student") {
            role = profile.role;
          }
        } catch {
          // profiles table not created yet: fall back to auth metadata only.
        }
        auth = { configured: true, live: true, name, email: user.email ?? "", role, demoBanner: false };
      } else {
        auth = { configured: true, live: false, demoBanner: demoCookie };
      }
    } catch {
      auth = { configured: true, live: false, demoBanner: demoCookie };
    }
  }

  return (
    <AppShell auth={auth}>
      {auth.live ? <SessionPolicy /> : null}
      {children}
    </AppShell>
  );
}
