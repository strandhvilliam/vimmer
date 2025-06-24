import { betterAuth, Session, User } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";
import { headers } from "next/headers";
import { resend } from "./resend";
import { OTPEmail } from "@vimmer/email/otp-email";
import { render } from "@react-email/render";
import { AWS_CONFIG } from "@/config/aws";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "*.vimmer.photo",
    "http://localhost:3000",
    `https://${AWS_CONFIG.routers.clientApp}`,
    "http://192.168.50.119:3000",
  ],
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in": {
            const { data, error } = await resend.emails.send({
              from: "Vimmer Support <support@vimmer.photo>",
              to: [email],
              subject: "Sign in to Your Account",
              html: await render(OTPEmail({ otp, username: email })),
            });
            console.log({ data, error });
            break;
          }
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
