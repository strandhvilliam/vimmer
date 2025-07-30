import type { SQSEvent } from "aws-lambda";
import { createContactSheet } from "./src/contact-sheet";
import type { CreateContactSheetParams } from "./src/types";
import { z } from "zod/v4";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import superjson from "superjson";
import { Resource } from "sst";

const EventSchema = z.object({
  domain: z.string(),
  participantRef: z.string(),
});

const createApiClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      httpBatchLink({
        url: Resource.Api.url + "trpc",
        transformer: superjson,
      }),
    ],
  });

export async function handler(event: SQSEvent) {
  const results = [];
  const apiClient = createApiClient();

  for (const record of event.Records) {
    try {
      const params = JSON.parse(record.body);

      const parsedParams = EventSchema.safeParse(params);
      if (!parsedParams.success) {
        throw new Error("Invalid event parameters");
      }

      const participant = await apiClient.participants.getByReference.query({
        reference: parsedParams.data.participantRef,
        domain: parsedParams.data.domain,
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      const topics = await apiClient.topics.getByDomain.query({
        domain: parsedParams.data.domain,
      });

      const reducedTopics = topics.map((t) => ({
        name: t.name,
        orderIndex: t.orderIndex,
      }));

      const keys = participant.submissions.reduce((acc, s) => {
        if (s.previewKey) {
          acc.push(s.previewKey);
        }
        return acc;
      }, [] as string[]);

      if (keys.length !== participant.submissions.length) {
        throw new Error("Missing preview keys");
      }

      await createContactSheet({
        keys,
        participantRef: parsedParams.data.participantRef,
        domain: parsedParams.data.domain,
        sponsorPosition: "bottom-left",
        sponsorKey: "0991_02_v1.jpg",
        topics: reducedTopics,
      });

      results.push({
        messageId: record.messageId,
        status: "success",
      });
    } catch (error) {
      console.error(`Error processing message ${record.messageId}:`, error);

      results.push({
        messageId: record.messageId,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      processedMessages: results.length,
      results,
    }),
  };
}
