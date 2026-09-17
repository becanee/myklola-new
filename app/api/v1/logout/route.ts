import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  // const response = NextResponse.json({ ok: true })

  const baseUrl = process.env.APP_URL ?? request.nextUrl.origin;
  const redirectUrl = new URL("/forbidden", baseUrl);
  const response = NextResponse.redirect(redirectUrl);

  // Clear all auth cookies
  response.headers.append(
    "Set-Cookie",
    "_T=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
  );
  response.headers.append(
    "Set-Cookie",
    "_C=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
  );
  response.headers.append("Set-Cookie", "_U=; Path=/; SameSite=Lax; Max-Age=0");

  return response;
}
