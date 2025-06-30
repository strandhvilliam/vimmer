import { createI18nMiddleware } from "next-international/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const I18nMiddleware = createI18nMiddleware({
  urlMappingStrategy: "rewriteDefault",
  locales: ["en", "sv"],
  defaultLocale: "en",
});

const authRoutes = [
  "/auth/admin/login",
  "/auth/admin/verify",
  "/auth/staff/login",
  "/auth/staff/verify",
];

const getHostDomain = (request: NextRequest) => {
  const hostDomain = request.headers.get("host")?.split(".").at(0);
  if (hostDomain?.startsWith("localhost")) return undefined;
  if (hostDomain?.startsWith("www")) return undefined;
  return hostDomain;
};

export function middleware(request: NextRequest) {
  // @ts-ignore
  const response = I18nMiddleware(request);

  const hostDomain = getHostDomain(request);
  const cookieDomain = request.cookies.get("activeDomain")?.value;

  const pathnameLocale = request.nextUrl.pathname.split("/", 2)?.[1];

  const pathnameWithoutLocale = pathnameLocale
    ? request.nextUrl.pathname.slice(pathnameLocale.length + 1)
    : request.nextUrl.pathname;

  const session = getSessionCookie(request);

  // IF AUTH ROUTE
  if (authRoutes.some((route) => pathnameWithoutLocale.includes(route))) {
    // Clear domain to be picked again when re-auth
    // clear subdomain from host
    if (hostDomain || cookieDomain) {
      response.headers.delete("x-domain");
      response.cookies.delete("activeDomain");
    }
    return response;
  }

  // IF ADMIN ROUTE

  if (pathnameWithoutLocale.includes("/admin")) {
    if (!session) {
      const url = new URL("/auth/admin/login", request.url);
      return NextResponse.redirect(url);
    }
    // TODO: validate domainAccessToken so that the user can access this domain

    if (hostDomain || cookieDomain) {
      if (hostDomain) response.cookies.set("activeDomain", hostDomain);
      if (cookieDomain) response.headers.set("x-domain", cookieDomain);
    } else {
      // redirect to /select-domain if no domain is set
      const url = new URL("/select-domain", request.url);
      url.searchParams.set("type", "admin");
      return NextResponse.redirect(url);
    }

    // redirect with subdomain if no subdomain
    if (!hostDomain && cookieDomain) {
      const newUrl = request.url
        .replace("https://", `https://${cookieDomain}.`)
        .replace("http://", `http://${cookieDomain}.`);

      if (newUrl !== request.url) {
        const url = new URL(newUrl, request.url);
        return NextResponse.redirect(url);
      }
    }
    return response;
  }

  // IF STAFF ROUTE
  if (pathnameWithoutLocale.includes("/staff")) {
    if (!session) {
      const url = new URL("/auth/staff/login", request.url);
      return NextResponse.redirect(url);
    }
    // TODO: validate domainAccessToken so that the user can access this domain

    if (hostDomain || cookieDomain) {
      if (hostDomain) response.cookies.set("activeDomain", hostDomain);
      if (cookieDomain) response.headers.set("x-domain", cookieDomain);
    } else {
      // redirect to /select-domain if no domain is set
      const url = new URL("/select-domain", request.url);
      url.searchParams.set("type", "staff");
      return NextResponse.redirect(url);
    }

    // redirect with subdomain if no subdomain
    if (!hostDomain && cookieDomain) {
      const newUrl = request.url
        .replace("https://", `https://${cookieDomain}.`)
        .replace("http://", `http://${cookieDomain}.`);

      if (newUrl !== request.url) {
        const url = new URL(newUrl, request.url);
        return NextResponse.redirect(url);
      }
    }
    return response;
  }

  if (hostDomain) {
    response.headers.set("x-domain", hostDomain);
  }

  // If Participante page but no hostdomain
  if (!hostDomain && pathnameWithoutLocale.includes("/participate")) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // if hostdomain but not participate page
  if (hostDomain && pathnameWithoutLocale === "/") {
    const url = new URL("/participate", request.url);
    return NextResponse.redirect(url);
  }

  // Public site / Landing page
  return response;

  // IF subdomain + /staff
  // check if domainAccessToken is set and valid
  // true => navigate to domain.vimmer.photo/staff
  // false => redirect to vimmer.photo/staff/login?domain=[domain]

  // IF subdomain + /
  // redirect to domain.vimmer.photo/

  // IF /admin
  // check if domainAccessToken is set and valid
  // true => navigate to domain.vimmer.photo/admin
  // false => redirect to vimmer.photo/admin/login

  // IF /staff
  // check if activeDomain is set
  // true => redirect to domain.vimmer.photo/staff
  // false => redirect to domain.vimmer.photo/staff/login

  // IF /
  // navigate to landing page vimmer.photo

  // if (request.nextUrl.pathname.includes("/staff")) {
  //   const session = getSessionCookie(request);

  //   if (
  //     !session &&
  //     !authRoutes.some((route) => request.nextUrl.pathname.includes(route))
  //   ) {
  //     const url = new URL("/staff/login", request.url);
  //     return NextResponse.redirect(url);
  //   }
  // }

  // if (
  //   request.nextUrl.pathname.includes("/admin") &&
  //   !authRoutes.some((route) => request.nextUrl.pathname.includes(route))
  // ) {
  //   const session = getSessionCookie(request);
  //   if (!session) {
  //     const url = new URL("/admin/login", request.url);
  //     return NextResponse.redirect(url);
  //   }
  // }

  return response;
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
};
