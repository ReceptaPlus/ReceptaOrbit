import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/server/auth/constants";

/* Next 16: `middleware.ts` virou `proxy.ts` (export `proxy`, runtime Node por padrão).
   Aqui só CHECK OTIMISTA por cookie — sem DB, sem decodificar JWT (roda em todo
   request, inclusive prefetch). Verificação real fica no DAL (Server Components). */

const PUBLIC_PREFIXES = ["/login", "/recuperar-senha", "/redefinir-senha", "/convite", "/r/"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/* Modo demo local (sem DATABASE_URL): sem login — trata todo request como autenticado. */
const DEMO = !process.env.DATABASE_URL;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (DEMO) {
    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next(); // /login navegável p/ demonstração
  }
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!isPublic(pathname) && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (hasSession && (pathname === "/login" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
