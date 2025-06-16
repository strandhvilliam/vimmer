import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const connectDb = () =>
  drizzle(client, {
    schema,
  });

export type Database = Awaited<ReturnType<typeof connectDb>>;
