import { type BetterAuthOptions, betterAuth } from "better-auth"
import { Config, Context, Effect } from "effect"
import { DrizzleClient } from "@blikka/db"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { EmailService, MagicLinkEmail, magicLinkEmailSubject, OTPEmail } from "@blikka/email"
import { nextCookies } from "better-auth/next-js"
import { emailOTP, magicLink } from "better-auth/plugins"

export class AuthConfig extends Context.Tag("AuthConfig")<
  AuthConfig,
  {
    readonly baseUrl: string
    readonly secret: string
    readonly emailConfig: {
      companyName: string
      companyLogoUrl: string
    }
  }
>() {}

// Extract domain without port for cookie domain
// Browsers treat localhost specially - they may ignore Domain attribute
// For localhost, we might need to omit domain or use a custom domain like myapp.local
function getCookieDomainForCrossSubDomain(): string | undefined {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3002"
  const domainWithoutPort = rootDomain.split(":")[0]

  // For localhost, browsers may ignore Domain attribute
  // Consider using a custom domain like myapp.local instead
  if (domainWithoutPort === "localhost") {
    // Try returning undefined to let Better Auth handle it
    // Or return without dot - Better Auth might add it
    return domainWithoutPort
  }

  // For custom domains, return without leading dot (Better Auth may add it)
  return domainWithoutPort
}

// For explicit domain setting in defaultCookieAttributes
function getCookieDomainWithDot(): string | undefined {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3002"
  const domainWithoutPort = rootDomain.split(":")[0]

  // For localhost, browsers may strip the leading dot
  // Try with dot anyway - some browsers might respect it
  if (domainWithoutPort === "localhost") {
    return `.${domainWithoutPort}`
  }

  return `.${domainWithoutPort}`
}

function getTrustedOrigins(): string[] {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3002"
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http"
  const domainWithoutPort = rootDomain.split(":")[0]
  const port = rootDomain.includes(":") ? rootDomain.split(":")[1] : null

  const baseUrl = port
    ? `${protocol}://${domainWithoutPort}:${port}`
    : `${protocol}://${domainWithoutPort}`

  return [
    baseUrl,
    `${protocol}://*.${domainWithoutPort}${port ? `:${port}` : ""}`,
    `${protocol}://www.${domainWithoutPort}${port ? `:${port}` : ""}`,
  ]
}

const isProduction = process.env.NODE_ENV === "production"

export class BetterAuthService extends Effect.Service<BetterAuthService>()(
  "@blikka/auth/better-auth-service",
  {
    dependencies: [DrizzleClient.Default, EmailService.Default],
    effect: Effect.gen(function* () {
      const authConfig = yield* AuthConfig
      const db = yield* DrizzleClient
      const emailService = yield* EmailService

      const cookieDomain = getCookieDomainForCrossSubDomain()
      console.log("[Better Auth] Cookie domain configured as:", cookieDomain)
      console.log("[Better Auth] Cookie domain with dot:", getCookieDomainWithDot())

      const config = {
        database: drizzleAdapter(db, {
          provider: "pg",
        }),
        secret: authConfig.secret,
        baseURL: authConfig.baseUrl,
        trustedOrigins: getTrustedOrigins(),
        advanced: {
          crossSubDomainCookies: {
            enabled: true,
            // Try without leading dot - Better Auth might add it
            domain: cookieDomain,
          },
          defaultCookieAttributes: {
            secure: isProduction, // HTTPS required in production
            httpOnly: true,
            // For localhost subdomains, "lax" should work since they're same-site
            // For production with HTTPS, "none" allows cross-subdomain cookies
            sameSite: isProduction ? "none" : "lax",
            // Explicitly set domain WITH leading dot
            // Note: Browsers may ignore this for localhost - consider using myapp.local instead
            ...(getCookieDomainWithDot() ? { domain: getCookieDomainWithDot() } : {}),
          },
        },
        plugins: [
          emailOTP({
            expiresIn: 60 * 60 * 2,
            sendVerificationOTP: async ({ email, otp, type }) => {
              switch (type) {
                case "sign-in": {
                  await Effect.runPromise(
                    emailService.send({
                      to: email,
                      subject: "Sign in to Your Account",
                      template: OTPEmail({
                        otp,
                        username: email,
                        companyName: authConfig.emailConfig.companyName,
                        companyLogoUrl: authConfig.emailConfig.companyLogoUrl,
                      }),
                    })
                  )
                  break
                }
                case "forget-password":
                  console.log(`Register OTP for ${email}: ${otp}`)
                  break
                case "email-verification":
                  console.log(`Reset OTP for ${email}: ${otp}`)
                  break
                default:
                  throw new Error(`Unknown OTP type: ${type}`)
              }
            },
          }),
          nextCookies(),
        ],
      } satisfies BetterAuthOptions

      return betterAuth(config)
    }),
  }
) {}

// export const initAuth = (options: {
//   baseUrl: string
//   secret: string
//   emailConfig: {
//     companyName: string
//     companyLogoUrl: string
//   }
// }) =>
//   Effect.gen(function* () {
//     const db = yield* DrizzleClient
//     const emailService = yield* EmailService

//     const config = {
//       database: drizzleAdapter(db, {
//         provider: "pg",
//       }),
//       secret: options.secret,
//       baseURL: options.baseUrl,
//       trustedOrigins: ["http://localhost:3002"],
//       plugins: [
//         magicLink({
//           sendMagicLink: async ({ email, token, url }, ctx) => {
//             console.log("Sending magic link to", email)
//             await Effect.runPromise(
//               emailService
//                 .send({
//                   to: email,
//                   subject: magicLinkEmailSubject({
//                     url,
//                     email,
//                   }),
//                   template: MagicLinkEmail({
//                     url,
//                     email,
//                     companyName: options.emailConfig.companyName,
//                     companyLogoUrl: options.emailConfig.companyLogoUrl,
//                   }),
//                 })
//                 .pipe(
//                   Effect.catchAll((error) => {
//                     console.error("Error sending magic link", error)
//                     return Effect.succeed(undefined)
//                   })
//                 )
//             )
//           },
//         }),
//         nextCookies(),
//       ],
//     } satisfies BetterAuthOptions

//     return betterAuth(config)
//   })

export type Session = ReturnType<typeof betterAuth>["$Infer"]["Session"]
