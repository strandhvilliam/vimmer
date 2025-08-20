import { betterAuth, Session, User } from "better-auth";
import { Pool } from "pg";
import { headers } from "next/headers";
import { nextCookies } from "better-auth/next-js";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
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
  plugins: [nextCookies()],
});

export async function getSession(): Promise<{
  session: Session;
  user: User;
} | null> {
  return headers().then((headers) =>
    auth.api.getSession({
      headers: headers,
    }),
  );
}
