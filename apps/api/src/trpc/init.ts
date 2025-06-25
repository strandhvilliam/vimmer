import { initTRPC } from "@trpc/server";
import { connectDb, type Database } from "../db";
import { createClient } from "@vimmer/supabase/lambda";
import type { SupabaseClient } from "@vimmer/supabase/types";
import { z, ZodError } from "zod/v4";

type TRPCContext = {
  db: Database;
  supabase: SupabaseClient;
};

export const createTRPCContext = async () => {
  const db = connectDb();
  const supabase = await createClient();
  return { db, supabase };
};

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError:
        error.cause instanceof ZodError
          ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
          : null,
    },
  }),
});

export const publicProcedure = t.procedure;

export const createTRPCRouter = t.router;
