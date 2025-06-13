import { betterAuth, Session, User } from "better-auth";
import { admin, emailOTP } from "better-auth/plugins";
import { OTPEmail } from "@vimmer/email/otp-email";
import { Pool } from "pg";
import { resend } from "./resend";
import { render } from "@react-email/render";
import { headers } from "next/headers";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  additionalFields: {
    role: {
      type: "string",
      required: false,
      defaultValue: "user",
      input: false,
    },
  },
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
  },
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  plugins: [
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in":
            const { data, error } = await resend.emails.send({
              from: "Acme <onboarding@resend.dev>",
              to: [email],
              subject: "Sign in to Your Account",
              html: await render(OTPEmail({ otp, username: email })),
            });
            console.log({ data, error });
            break;
          case "forget-password":
            console.log(`Register OTP for ${email}: ${otp}`);
            break;
          case "email-verification":
            console.log(`Reset OTP for ${email}: ${otp}`);
            break;
          default:
            throw new Error(`Unknown OTP type: ${type}`);
        }
      },
    }),
  ],
});

export async function getSession(): Promise<{
  session: Session;
  user: User;
} | null> {
  return headers().then((headers) =>
    auth.api.getSession({
      headers: headers,
    })
  );
}
