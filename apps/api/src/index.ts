import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { appRouter } from "./trpc/routers/_app";
import { createTRPCContext } from "./trpc";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda";

const app = new Hono();

app.use((c, next) => {
  console.log("request", c.req.raw.url);
  return next();
});

// app.use(
//   "/trpc/*",
//   cors({
//     origin: "*",
//   })
// );

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

app.get("/", (c) => c.text("Hello World"));

export const handler = handle(app);

// export const handler = awsLambdaRequestHandler({
//   router: appRouter,
//   createContext: async () => {
//     console.log("creating context");
//     const ctx = await createTRPCContext();
//     return ctx;
//   },
// });
