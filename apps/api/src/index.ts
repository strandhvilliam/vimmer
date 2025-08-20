import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { appRouter } from "./trpc/routers/_app";
import { createTRPCContext } from "./trpc";
import { secureHeaders } from "hono/secure-headers";
import { realtimeRevalidateMiddleware } from "./middlewares/realtime-revalidate";
import { errorHandler } from "./utils/error-handler";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";

const app = new Hono();

// app.use(secureHeaders())

if (process.env.IS_CONTAINER === "true") {
  app.use(
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  );
}
app.use(realtimeRevalidateMiddleware());

app.onError(errorHandler);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createTRPCContext,
  }),
);

app.get("/", (c) => c.text("Hello World"));

app.get("/health", (c) => {
  console.log("health check", new Date().toISOString());
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3222;
console.log(`Server running on port ${port}`);

export const handler = handle(app);

export default {
  port,
  fetch: app.fetch,
  reusePort: true,
  development: false,
};
