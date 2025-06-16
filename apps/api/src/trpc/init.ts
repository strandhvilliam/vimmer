import { initTRPC } from "@trpc/server";
import { connectDb, type Database } from "../db";

type TRPCContext = {
  db: Database;
};

export const createTRPCContext = async () => {
  const db = connectDb();
  return { db };
};

const t = initTRPC.context<TRPCContext>().create();

export const publicProcedure = t.procedure;

export const createTRPCRouter = t.router;
