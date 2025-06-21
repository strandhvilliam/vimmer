import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const I18nMiddleware = createI18nMiddleware({
  urlMappingStrategy: "rewriteDefault",
  locales: ["en", "sv"],
  defaultLocale: "en",
});

const authRoutes = ["/staff/login", "/staff/verify"];

export function middleware(request: NextRequest) {
  // @ts-ignore
  const response = I18nMiddleware(request);

  const domain = request.nextUrl.hostname.split(".").at(0);
  if (domain) {
    response.headers.set("x-domain", domain);
  }

  if (request.nextUrl.pathname.includes("/staff")) {
    const session = getSessionCookie(request);

    if (
      !session &&
      !authRoutes.some((route) => request.nextUrl.pathname.endsWith(route))
    ) {
      const url = new URL("/staff/login", request.url);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
