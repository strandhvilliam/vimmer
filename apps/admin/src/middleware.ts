import { getSessionCookie } from "better-auth";
import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest, NextResponse } from "next/server";

const I18nMiddleware = createI18nMiddleware({
  urlMappingStrategy: "rewriteDefault",
  locales: ["en", "sv"],
  defaultLocale: "en",
});

const authRoutes = ["/login", "/signup", "/verify"];

export function middleware(request: NextRequest) {
  //@ts-expect-error
  const response = I18nMiddleware(request);

  const pathnameLocale = request.nextUrl.pathname.split("/", 2)?.[1];
  const pathnameWithoutLocale = pathnameLocale
    ? request.nextUrl.pathname.slice(pathnameLocale.length + 1)
    : request.nextUrl.pathname;

  const url = new URL(pathnameWithoutLocale || "/", request.url);

  const sessionCookie = getSessionCookie(request);
  console.log("sessionCookie", sessionCookie);

  if (!sessionCookie && !authRoutes.includes(url.pathname)) {
    const returnUrl = `${url.pathname.substring(1)}${url.search}`;
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("return_to", returnUrl);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
