import { defineConfig } from "drizzle-kit"
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DEV_DATABASE_URL!,
  },
})
