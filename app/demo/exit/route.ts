import { NextResponse } from "next/server";

/** Leaves demo access: clears the demo cookie and goes to the sign-in page. */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(`${origin}/login`);
  response.cookies.set("axlori_demo", "", { path: "/", maxAge: 0 });
  return response;
}
