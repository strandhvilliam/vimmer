import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { appRouter } from "./trpc/routers/_app";
import { createTRPCContext } from "./trpc";
import { secureHeaders } from "hono/secure-headers";
import { realtimeRevalidateMiddleware } from "./middlewares/realtime-revalidate";
import { errorHandler } from "./utils/error-handler";

const app = new Hono();

app.use(secureHeaders());
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

export const handler = handle(app);
