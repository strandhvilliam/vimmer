import { env } from "hono/adapter";
import { HTTPException } from "hono/http-exception";
import { PostHog } from "posthog-node";
import { type ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.log("errorHandler", err);
  const { POSTHOG_API_KEY, POSTHOG_HOST } = env<{
    POSTHOG_API_KEY: string;
    POSTHOG_HOST: string;
  }>(c);

  console.log("[API_ERROR]:", err);
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
    },
  );
  posthog.shutdown();

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json({ error: err.message }, 500);
};
