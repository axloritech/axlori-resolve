import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Session refresh + server-side route protection.
 *
 * Behavior:
 *  - Supabase not configured yet: middleware is a no-op; the app runs in
 *    pure frontend-demo mode (real auth is unavailable and auth pages say so).
 *  - Supabase configured: protected routes require a verified session, or an
 *    explicit demo-access cookie which grants demo-viewing only and carries no
 *    privileges. All data checks are still repeated in RLS once post-auth data
 *    features land; middleware is a navigation control, not the security layer.
 */

const PROTECTED = ["/", "/reports", "/locations", "/analytics", "/team", "/settings"];
const AUTHENTICATED_ONLY_EXITS = ["/login", "/signup"];
const DEMO_COOKIE = "axlori_demo";

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(`${p}/`)));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // getUser() verifies the token against Supabase rather than trusting the cookie.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  const demoAccess = request.cookies.get(DEMO_COOKIE)?.value === "1";
  const emailConfirmed = user ? (user as { email_confirmed_at?: string }).email_confirmed_at != null : false;

  if (isProtectedRoute(pathname)) {
    if (user && !emailConfirmed) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-email";
      url.searchParams.set("email", user.email ?? "");
      return NextResponse.redirect(url);
    }
    if (!user && !demoAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (user && AUTHENTICATED_ONLY_EXITS.some((p) => pathname === p)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Skip static assets, generated icons, placeholders and the manifest.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|icons|placeholders|robots.txt|sitemap.xml).*)",
  ],
};
