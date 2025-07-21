import { createMiddleware } from "hono/factory";
import {
  IoTDataPlaneClient,
  PublishCommand,
} from "@aws-sdk/client-iot-data-plane";
import { Resource } from "sst";

const iotDataPlaneClient = new IoTDataPlaneClient({});

export const realtimeRevalidateMiddleware = () =>
  createMiddleware(async (c, next) => {
    await next();
    try {
      const method = c.req.method;
      if (method === "POST") {
        const domain = c.req.header("x-domain");
        const procedureName = c.req.path.split("/").pop();
        const [query, action] = procedureName?.split(".") ?? [];
        await iotDataPlaneClient.send(
          new PublishCommand({
            payload: Buffer.from(
              JSON.stringify({
                domain,
                query,
                action,
              }),
            ),
            topic: `${Resource.App.name}/${Resource.App.stage}/revalidate`,
          }),
        );
      }
    } catch (e) {
      console.error(e);
    }
  });
