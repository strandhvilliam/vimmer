import { env } from "hono/adapter";
import { PostHog } from "posthog-node";
import { type ErrorHandler } from "hono";

export const posthogCaptureException: ErrorHandler = (err, c) => {
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
    },
  );
  posthog.shutdown();
  return c.text("Internal Server Error", 500);
};
