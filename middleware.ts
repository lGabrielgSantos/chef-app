import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  localeDetection: true,
});

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
const PRIVATE_PREFIXES = ["/dashboard", "/orders", "/products", "/clients"];

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value ?? "";

  const pathWithoutLocale = pathname.replace(/^\/(pt|en)(?=\/|$)/, "");

  const currentLocale = pathname.startsWith("/en") ? "en" : "pt";

  if (PUBLIC_PATHS.includes(pathWithoutLocale)) {
    if (token) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/dashboard`, request.url)
      );
    }
    return response;
  }

  if (PRIVATE_PREFIXES.some((p) => pathWithoutLocale.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}/login`, request.url)
      );
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
