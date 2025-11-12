import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { locales } from "@/config/locales";
import { publicPaths, privatePrefixes, defaultRedirect } from "@/config/routes";

const intlMiddleware = createIntlMiddleware({
  locales: locales.supported,
  defaultLocale: locales.default,
  localeDetection: locales.detection,
});

export function middleware(request: NextRequest) {
  const response = intlMiddleware(request);
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value ?? "";

  const pathWithoutLocale = pathname.replace(/^\/(pt|en)(?=\/|$)/, "");
  const currentLocale = pathname.startsWith("/en") ? "en" : "pt";

  if (publicPaths.includes(pathWithoutLocale)) {
    if (token) {
      return NextResponse.redirect(
        new URL(`/${currentLocale}${defaultRedirect}`, request.url)
      );
    }
    return response;
  }

  if (privatePrefixes.some((p) => pathWithoutLocale.startsWith(p))) {
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
