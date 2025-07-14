import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { admin } from "better-auth/plugins";

export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});
