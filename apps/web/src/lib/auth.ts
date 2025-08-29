import { betterAuth, Session, User } from "better-auth"
import { Pool } from "pg"
import { headers } from "next/headers"
import { nextCookies } from "better-auth/next-js"
import { emailOTP } from "better-auth/plugins"
import { resend } from "./resend"
import { OTPEmail } from "@vimmer/email/otp-email"
import { render } from "@react-email/render"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  // emailAndPassword: {
  //   enabled: true,
  //   requireEmailVerification: false,
  // },
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "*.vimmer.photo",
    "*.blikka.app",
    "*.localhost:3000",
    "http://localhost:3000",
    "vimmer.photo",
    "blikka.app",
    "http://192.168.50.186:3000",
  ],
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
  },
  // advanced: {
  //   crossSubDomainCookies: {
  //     enabled: true,
  //     additionalCookies: ["activeDomain", "domainAccessToken"],
  //     domain:
  //       process.env.NODE_ENV === "production" ? "blikka.app" : "localhost",
  //   },
  // },
  plugins: [
    nextCookies(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in": {
            const { data, error } = await resend.emails.send({
              from: "Blikka Support <support@blikka.app>",
              to: [email],
              subject: "Sign in to Your Account",
              html: await render(OTPEmail({ otp, username: email })),
            })
            console.log({ data, error })
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
  ],
})

export async function getSession(): Promise<{
  session: Session
  user: User
} | null> {
  return headers().then((headers) =>
    auth.api.getSession({
      headers: headers,
    })
  )
}
