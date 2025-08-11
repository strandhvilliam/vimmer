import { createI18nMiddleware } from "next-international/middleware"
import { NextMiddleware, NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"
import { jwtVerify } from "jose"

const I18nMiddleware = createI18nMiddleware({
  urlMappingStrategy: "rewriteDefault",
  locales: ["en", "sv"],
  defaultLocale: "en",
})

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|robots.txt).*)"],
}

const authRoutes = [
  "/auth/admin/login",
  "/auth/admin/verify",
  "/auth/staff/login",
  "/auth/staff/verify",
]

type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware

function stackMiddlewares(
  functions: MiddlewareFactory[] = [],
  index = 0
): NextMiddleware {
  const current = functions[index]
  if (current) {
    const next = stackMiddlewares(functions, index + 1)
    return current(next)
  }
  return () => NextResponse.next()
}

function withSubdomainRewrite(request: NextRequest, response: NextResponse) {
  const subdomain = extractSubdomain(request)
  if (subdomain) {
    return NextResponse.rewrite(new URL(`/${subdomain}`, request.url))
  }
  return response
}

export function middleware(request: NextRequest) {
  const response = I18nMiddleware(request)
  const pathnameWithoutLocale = getPathnameWithoutLocale(request)

  if (authRoutes.some((route) => pathnameWithoutLocale.includes(route))) {
    return handleAuthRoute(request, response)
  }
  if (pathnameWithoutLocale.includes("/admin")) {
    return handleAdminRoute(request, response)
  }
  if (pathnameWithoutLocale.includes("/staff")) {
    return handleStaffRoute(request, response)
  }

  return handlePublicRoute(request, response)
}

function handlePublicRoute(request: NextRequest, response: NextResponse) {
  const hostDomain = getHostDomain(request)
  const pathnameWithoutLocale = getPathnameWithoutLocale(request)

  if (hostDomain) {
    response.headers.set("x-domain", hostDomain)
  }

  // Redirect to landing page if no hostname
  if (!hostDomain && pathnameWithoutLocale.includes("/participate")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Redirect to participate page if hostname but not participate page
  if (hostDomain && pathnameWithoutLocale === "/") {
    return NextResponse.redirect(new URL("/participate", request.url))
  }

  return response
}

function handleAuthRoute(request: NextRequest, response: NextResponse) {
  const hostDomain = getHostDomain(request)
  const cookieDomain = request.cookies.get("activeDomain")?.value

  // if (cookieDomain) {
  //   response.cookies.delete("activeDomain");
  //   response.cookies.delete("domainAccessToken");
  // }

  // if (hostDomain) {
  //   response.headers.delete("x-domain");
  // }

  return response
}

async function handleAdminRoute(request: NextRequest, response: NextResponse) {
  const hostDomain = getHostDomain(request)
  const cookieDomain = request.cookies.get("activeDomain")?.value
  const domainAccessToken = request.cookies.get("domainAccessToken")?.value

  const session = getSessionCookie(request)

  if (!session) {
    const url = new URL("/auth/admin/login", request.url)
    return NextResponse.redirect(url)
  }

  if (hostDomain || cookieDomain) {
    if (hostDomain) response.cookies.set("activeDomain", hostDomain)
    if (cookieDomain) response.headers.set("x-domain", cookieDomain)

    if (
      !domainAccessToken ||
      !(await verifyDomainAccessToken(
        domainAccessToken,
        hostDomain || cookieDomain || ""
      ))
    ) {
      const url = new URL("/select-domain", request.url)
      url.searchParams.set("type", "admin")
      const response = NextResponse.redirect(url)
      return response
    }
  } else {
    const url = new URL("/select-domain", request.url)
    url.searchParams.set("type", "admin")
    return NextResponse.redirect(url)
  }

  if (!hostDomain && cookieDomain) {
    const newUrl = request.url
      .replace("https://", `https://${cookieDomain}.`)
      .replace("http://", `http://${cookieDomain}.`)

    if (newUrl !== request.url) {
      const url = new URL(newUrl, request.url)
      return NextResponse.redirect(url)
    }
  }
  return response
}

async function handleStaffRoute(request: NextRequest, response: NextResponse) {
  const hostDomain = getHostDomain(request)
  const cookieDomain = request.cookies.get("activeDomain")?.value
  const domainAccessToken = request.cookies.get("domainAccessToken")?.value

  console.log("hostDomain", hostDomain)
  console.log("cookieDomain", cookieDomain)

  const session = getSessionCookie(request)
  console.log("session", session)

  if (!session) {
    const url = new URL("/auth/staff/login", request.url)
    return NextResponse.redirect(url)
  }

  if (hostDomain || cookieDomain) {
    if (hostDomain) response.cookies.set("activeDomain", hostDomain)
    if (cookieDomain) response.headers.set("x-domain", cookieDomain)

    if (
      !domainAccessToken ||
      !(await verifyDomainAccessToken(
        domainAccessToken,
        hostDomain || cookieDomain || ""
      ))
    ) {
      const url = new URL("/select-domain", request.url)
      url.searchParams.set("type", "staff")
      const response = NextResponse.redirect(url)
      response.cookies.delete("activeDomain")
      response.cookies.delete("domainAccessToken")
      return response
    }
  } else {
    const url = new URL("/select-domain", request.url)
    url.searchParams.set("type", "staff")
    return NextResponse.redirect(url)
  }

  if (!hostDomain && cookieDomain) {
    const newUrl = request.url
      .replace("https://", `https://${cookieDomain}.`)
      .replace("http://", `http://${cookieDomain}.`)

    if (newUrl !== request.url) {
      const url = new URL(newUrl, request.url)
      return NextResponse.redirect(url)
    }
  }
  return response
}

function getHostDomain(request: NextRequest) {
  const host = request.headers.get("host")
  const hostDomain = host?.slice(0, host.indexOf(":")).split(".").at(0)
  if (!hostDomain) return null
  const routeToApex = [
    "blikka",
    "vimmer",
    "www",
    "localhost",
    "blog",
    "api",
    "docs",
    "assets",
    "m",
  ]
  if (routeToApex.includes(hostDomain)) return null
  return hostDomain
}

async function verifyDomainAccessToken(
  token: string,
  domain: string
): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    return payload.domain === domain
  } catch {
    return false
  }
}

function getPathnameWithoutLocale(request: NextRequest) {
  const pathnameLocale = request.nextUrl.pathname.split("/", 2)?.[1]
  return pathnameLocale
    ? request.nextUrl.pathname.slice(pathnameLocale.length + 1)
    : request.nextUrl.pathname
}

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url
  const host = request.headers.get("host") || ""
  const hostname = host.split(":")[0]

  if (!hostname) return null

  // Local development environment
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.localhost/)
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1]
    }

    // Fallback to host header approach
    if (hostname.includes(".localhost")) {
      return hostname.split(".").at(0) || null
    }

    return null
  }

  const rootDomain = "blikka.app"

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomain &&
    hostname !== `www.${rootDomain}` &&
    hostname.endsWith(`.${rootDomain}`)

  return isSubdomain ? hostname.replace(`.${rootDomain}`, "") : null
}
