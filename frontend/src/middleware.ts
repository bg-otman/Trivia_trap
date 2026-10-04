import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const hasAccessToken = Boolean(request.cookies.get("access_token")?.value);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/profile") && !hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/login") && hasAccessToken) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login/:path*", "/profile/:path*", "/users/:path*"],
};