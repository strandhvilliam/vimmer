import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3002",
  plugins: [emailOTPClient()],
})
