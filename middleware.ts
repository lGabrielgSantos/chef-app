import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

// ⚙️ Configuração direta do next-intl (NÃO importar next-intl.config.ts)
const intlMiddleware = createIntlMiddleware({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  localeDetection: true,
});

// 🔒 Caminhos públicos e privados (sem prefixo de idioma)
const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
const PRIVATE_PREFIXES = ["/dashboard", "/pedidos", "/produtos", "/clientes"];

export function middleware(request: NextRequest) {
  // 1️⃣ Primeiro aplica o middleware do next-intl
  const response = intlMiddleware(request);

  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value ?? "";

  // 2️⃣ Remove o prefixo de idioma (/pt ou /en)
  const pathWithoutLocale = pathname.replace(/^\/(pt|en)(?=\/|$)/, "");

  // 3️⃣ Detecta o idioma atual
  const currentLocale = pathname.startsWith("/en") ? "en" : "pt";

  // 4️⃣ Regras de autenticação
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

// 🔧 Aplica o middleware a todas as rotas (exceto assets, API e arquivos estáticos)
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
