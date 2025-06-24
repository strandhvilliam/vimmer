import { PostHog } from "posthog-node";

function PostHogClient() {
  if (!process.env.POSTHOG_API_KEY) {
    console.warn(
      "POSTHOG_API_KEY is not set. Server-side events will not be sent."
    );
    return {
      capture: () => {},
      shutdown: () => Promise.resolve(),
    };
  }

  const posthogClient = new PostHog(process.env.POSTHOG_API_KEY, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return posthogClient;
}

export const posthogServer = PostHogClient();
