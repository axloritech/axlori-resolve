import { NextResponse } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";

const DEMO_COOKIE = "axlori_demo";

/**
 * Explicitly enters demo access while authentication is enabled. The cookie
 * only unlocks the demo view and never grants privileges; everything the
 * visitor sees is fictional demo data, and backend checks (RLS) still apply
 * to any real data once it exists.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const target = isSupabaseConfigured() ? "/" : "/";
  const response = NextResponse.redirect(`${origin}${target}`);
  response.cookies.set(DEMO_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    sameSite: "lax",
  });
  return response;
}
