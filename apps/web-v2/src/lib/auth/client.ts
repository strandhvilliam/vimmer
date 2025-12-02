import { createAuthClient } from "better-auth/react"
import { emailOTPClient } from "better-auth/client/plugins"
import { protocol } from "@/config"

export const authClient = createAuthClient({
  baseURL: `${protocol}://${process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3002"}`,
  plugins: [emailOTPClient()],
})
