import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwtDetailed } from "@/lib/jwt";
import { securedDecrypt } from "@/lib/encrypter-server";

const PROTECTED_PREFIXES = ["/admin", "/tickets"];

// Clear both auth cookies by setting Max-Age=0 with matching path
function clearAuthCookies(): NextResponse {
  const resp = NextResponse.json({});
  resp.cookies.set("_T", "", { path: "/", maxAge: 0 });
  resp.cookies.set("_C", "", { path: "/", maxAge: 0 });
  return resp;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // If user hits /forbidden while already logged in — redirect to /
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

  // Check if this route is protected
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix),
  );

  // Route "/" — require _T JWT cookie, otherwise redirect /forbidden
  if (path === "/" || isProtected) {
    const token = request.cookies.get("_T")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    const result = await verifyJwtDetailed(token);
    if (!result.ok) {
      clearAuthCookies();
      return NextResponse.redirect(new URL("/forbidden", request.url));
    }

    // If user is CLIENT and trying to access /admin — redirect to /
    if (isProtected) {
      try {
        const encryptedUser = request.cookies.get("_U")?.value;
        if (encryptedUser) {
          const user = securedDecrypt<{ role?: string }>(decodeURIComponent(encryptedUser));
          if (user?.role === "CLIENT") {
            return NextResponse.redirect(new URL("/", request.url));
          }
        }
      } catch {
        // fallback — allow access
      }
    }

    return null;
  }

  return null;
}

export const config = {
  matcher: ["/", "/admin/:path*", "/forbidden"],
};
