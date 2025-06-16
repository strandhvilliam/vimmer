import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { apiRouter } from "./trpc/routers/api.router";
import { createTRPCContext } from "./trpc/init";

const app = new Hono();

app.get("/", (c) => c.text("Hello World"));

app.use(
  "/trpc/*",
  trpcServer({
    router: apiRouter,
    createContext: createTRPCContext,
  })
);

export const handler = handle(app);
