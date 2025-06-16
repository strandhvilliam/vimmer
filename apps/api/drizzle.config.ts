import type { Config } from "drizzle-kit";

export default {
  schema: "./apps/api/src/db/schema.ts",
  out: "./apps/api/.migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
