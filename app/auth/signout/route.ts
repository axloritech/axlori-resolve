import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

async function handle(request: Request) {
  const origin = new URL(request.url).origin;

  if (isSupabaseConfigured()) {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  const response = NextResponse.redirect(`${origin}/login`, { status: 303 });
  response.cookies.set("axlori_demo", "", { path: "/", maxAge: 0 });
  return response;
}

/** Signs the user out server-side and clears the demo-access cookie. */
export async function POST(request: Request) {
  return handle(request);
}

/** GET fallback for environments where a form post is unavailable. */
export async function GET(request: Request) {
  return handle(request);
}
