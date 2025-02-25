import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        switch (type) {
          case "sign-in":
            console.log(`Login OTP for ${email}: ${otp}`);
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
