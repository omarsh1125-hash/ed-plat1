import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { locales, defaultLocale } from "@/i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

function getLocaleFromRequest(req: NextRequest): string {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && locales.includes(cookie as any)) return cookie;

  const accept = req.headers.get("accept-language") || "";
  if (accept.toLowerCase().includes("ar")) return "ar";
  return defaultLocale;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip Next internals, API routes, uploads and static files.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Does the path already start with a supported locale?
  const pathLocale = locales.find(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  // Redirect locale-less paths to a locale-prefixed URL.
  if (!pathLocale) {
    const locale = getLocaleFromRequest(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Route protection for dashboard (student) and admin areas.
  const rest = pathname.replace(`/${pathLocale}`, "") || "/";
  const isDashboard = rest.startsWith("/dashboard") || rest.startsWith("/learn");
  const isAdmin = rest.startsWith("/admin");

  if (isDashboard || isAdmin) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = `/${pathLocale}/login`;
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (isAdmin && token.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = `/${pathLocale}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
