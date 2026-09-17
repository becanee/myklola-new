import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtDetailed } from "@/lib/jwt";

const PROTECTED_PREFIXES = ["/admin"];

// Clear both auth cookies by setting Max-Age=0 with matching path
function clearAuthCookies(): NextResponse {
  const resp = NextResponse.json({});
  resp.cookies.set("_T", "", { path: "/", maxAge: 0 });
  resp.cookies.set("_C", "", { path: "/", maxAge: 0 });
  return resp;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // If user hits /authentication while already logged in → redirect to /client
  if (path.startsWith("/forbidden")) {
    const token = request.cookies.get("_T")?.value;
    if (token) {
      const result = await verifyJwtDetailed(token);
      if (result.ok) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    return null;
  }

  // Route "/" — require _T JWT cookie, otherwise redirect /forbidden
  if (path === "/") {
    const token = request.cookies.get("_T")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    const result = await verifyJwtDetailed(token);
    if (!result.ok) {
      clearAuthCookies();
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }
    return null;
  }

  // Check if this route is protected
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );
  if (!isProtected) return null;

  // Read JWT cookie "_T"
  const token = request.cookies.get("_T")?.value;
  if (!token) {
    const loginUrl = new URL("/forbidden", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Detailed verification — distinguish expired from other failures
  const result = await verifyJwtDetailed(token);
  if (!result.ok) {
    const loginUrl = new URL("/forbidden", request.url);
    loginUrl.searchParams.set("redirect", path);
    clearAuthCookies().headers.set("Location", loginUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  return null;
}

export const config = {
  matcher: ["/", "/admin/:path*", "/forbidden"],
};
