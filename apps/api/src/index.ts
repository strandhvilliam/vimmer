import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { appRouter } from "./trpc/routers/_app";
import { createTRPCContext } from "./trpc";
import { env } from "hono/adapter";
import { PostHog } from "posthog-node";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono();

app.use(secureHeaders());

app.use((c, next) => {
  console.log("request", c.req.raw.url);
  return next();
});

app.onError((err, c) => {
  const { POSTHOG_API_KEY, POSTHOG_HOST } = env<{
    POSTHOG_API_KEY: string;
    POSTHOG_HOST: string;
  }>(c);
  const posthog = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
  });

  posthog.captureException(
    new Error(err.message, { cause: err }),
    "user_distinct_id_with_err_rethrow",
    {
      path: c.req.path,
      method: c.req.method,
      url: c.req.url,
      headers: c.req.header(),
    }
  );
  posthog.shutdown();
  return c.text("Internal Server Error", 500);
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: createTRPCContext,
  })
);

app.get("/", (c) => c.text("Hello World"));

export const handler = handle(app);
