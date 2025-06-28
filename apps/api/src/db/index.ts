import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// export interface IdResponse {
//   id: number | null;
// }

export const db = drizzle(client, {
  schema,
});

export type Database = PostgresJsDatabase<typeof schema>;
