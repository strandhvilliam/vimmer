import { initTRPC } from "@trpc/server";
import { connectDb, type Database } from "../db";
import { createClient } from "@vimmer/supabase/lambda";
import type { SupabaseClient } from "@vimmer/supabase/types";

type TRPCContext = {
  db: Database;
  supabase: SupabaseClient;
};

export const createTRPCContext = async () => {
  const db = connectDb();
  const supabase = await createClient();
  return { db, supabase };
};

const t = initTRPC.context<TRPCContext>().create();

export const publicProcedure = t.procedure;

export const createTRPCRouter = t.router;
