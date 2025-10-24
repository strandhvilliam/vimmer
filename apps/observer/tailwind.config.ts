import baseConfig from "@vimmer/ui/tailwind.config"
import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  presets: [baseConfig],
} satisfies Config
