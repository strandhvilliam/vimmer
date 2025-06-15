import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

const app = new Hono();

app.get("/", (c) => c.text("Hello World"));

export const handler = handle(app);
