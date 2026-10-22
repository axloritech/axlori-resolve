"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const REMEMBER_KEY = "axlori.remember_session";
export const SESSION_SENTINEL_KEY = "axlori.browser_session_active";

export function setRememberPreference(remember: boolean) {
  try {
    window.localStorage.setItem(REMEMBER_KEY, remember ? "1" : "0");
    window.sessionStorage.setItem(SESSION_SENTINEL_KEY, "1");
  } catch {
    // Storage unavailable: session policy degrades harmlessly.
  }
}

/**
 * "Remember me" enforcement. When the user chose not to be remembered, the
 * browser session is ended once the browser session itself ends (detected via
 * a sessionStorage sentinel that dies with the tab).
 */
export default function SessionPolicy() {
  const router = useRouter();

  useEffect(() => {
    try {
      const remember = window.localStorage.getItem(REMEMBER_KEY);
      const active = window.sessionStorage.getItem(SESSION_SENTINEL_KEY);
      if (remember === "0" && !active) {
        const supabase = createBrowserSupabaseClient();
        void supabase.auth.signOut().finally(() => {
          router.push("/login");
          router.refresh();
        });
        return;
      }
      window.sessionStorage.setItem(SESSION_SENTINEL_KEY, "1");
    } catch {
      // Ignore storage errors.
    }
  }, [router]);

  return null;
}
