import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isRateLimited } from "@/lib/rateLimit";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Rate Limiting for Auth/Form Submissions (POST requests)
  if (request.method === "POST") {
    const isAuthRoute = pathname.startsWith("/api/auth") || pathname === "/login" || pathname === "/register";
    const isServerAction = request.headers.has("next-action");

    if (isAuthRoute || isServerAction) {
      const ip = (request as { ip?: string }).ip || request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
      // Limit to 10 auth/actions requests per minute per IP
      const rate = isRateLimited(`auth_${ip}`, { limit: 10, windowMs: 60 * 1000 });

      if (rate.limited) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: `Terlalu banyak permintaan. Silakan coba lagi dalam ${rate.reset} detik.`,
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(rate.reset),
            },
          }
        );
      }
    }
  }

  // 2. Authentication flow check
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Allow access to auth-related paths
  if (pathname.startsWith("/api/auth") || pathname === "/login" || pathname === "/register") {
    // If already authenticated, redirect away from login/register
    if (token && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/history/:path*",
    "/manage/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/api/auth/:path*",
  ],
};
