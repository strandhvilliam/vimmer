import { initTRPC } from "@trpc/server";
import { db, type Database } from "../db";
import { createClient } from "@vimmer/supabase/lambda";
import type { SupabaseClient } from "@vimmer/supabase/types";
import { z, ZodError } from "zod/v4";
import superjson from "superjson";

export type TRPCContext = {
  db: Database;
  supabase: SupabaseClient;
};

export const createTRPCContext = async (): Promise<TRPCContext> => {
  const supabase = await createClient();
  return { db, supabase };
};

export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
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

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
