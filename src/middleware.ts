import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;
  const isLoggedIn = Boolean(
    cookies.get("next-auth.session-token") ||
      cookies.get("__Secure-next-auth.session-token")
  );


  // Allow API routes (important for NextAuth)
  if (nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Allow static assets
  if (
    nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.startsWith("/images") ||
    nextUrl.pathname.startsWith("/icons") ||
    nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Public routes that don't require auth
  const publicRoutes = ["/", "/auth/verify-email", "/auth/error"];
  if (publicRoutes.includes(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Auth routes (login, signup, etc.)
  const authRoutes = [
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
  ];

  if (authRoutes.includes(nextUrl.pathname)) {
    if (isLoggedIn) {
      console.log("Redirecting logged-in user from auth page to dashboard");
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  // Protected routes
  if (nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      console.log("Redirecting non-logged-in user to signin");
      return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }
    return NextResponse.next();
  }

  // Default: allow
  return NextResponse.next();
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
