import { getSessionCookie } from "better-auth/cookies";
import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const I18nMiddleware = createI18nMiddleware({
  urlMappingStrategy: "rewriteDefault",
  locales: ["en", "sv"],
  defaultLocale: "en",
});

const authRoutes = ["/login", "/signup", "/verify"];

async function verifyDomainAccessToken(
  token: string,
  domain: string
): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return payload.domain === domain;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  //@ts-ignore
  const response = I18nMiddleware(request);

  const pathnameLocale = request.nextUrl.pathname.split("/", 2)?.[1];
  const pathnameWithoutLocale = pathnameLocale
    ? request.nextUrl.pathname.slice(pathnameLocale.length + 1)
    : request.nextUrl.pathname;

  const url = new URL(pathnameWithoutLocale || "/", request.url);
  const urlDomain = url.pathname.split("/")[1];

  const session = getSessionCookie(request);

  if (!session && !authRoutes.includes(url.pathname)) {
    const returnUrl = `${url.pathname.substring(1)}${url.search}`;
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("return_to", returnUrl);
    return NextResponse.redirect(redirectUrl);
  }

  if (
    request.cookies &&
    !authRoutes.includes(url.pathname) &&
    !url.pathname.includes("/domains")
  ) {
    const activeDomainCookie = request.cookies.get("activeDomain")?.value;
    const domainAccessToken = request.cookies.get("domainAccessToken")?.value;

    if (!activeDomainCookie) {
      const redirectUrl = new URL("/domains", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (
      !domainAccessToken ||
      !(await verifyDomainAccessToken(domainAccessToken, activeDomainCookie))
    ) {
      const response = NextResponse.redirect(new URL("/domains", request.url));
      response.cookies.delete("activeDomain");
      response.cookies.delete("domainAccessToken");
      return response;
    }

    if (url.pathname === "/onboarding") {
      return response;
    }

    if (urlDomain && urlDomain !== activeDomainCookie) {
      const redirectUrl = new URL(`/${activeDomainCookie}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (url.pathname === "/") {
      const redirectUrl = new URL(`/${activeDomainCookie}`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
