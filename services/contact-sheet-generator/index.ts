import type { SQSEvent } from "aws-lambda";
import { createContactSheet } from "./src/contact-sheet";
import { z } from "zod/v4";
import { db } from "@vimmer/api/db";
import {
  getParticipantByReferenceQuery,
  updateParticipantMutation,
} from "@vimmer/api/db/queries/participants.queries";
import { getTopicsByDomainQuery } from "@vimmer/api/db/queries/topics.queries";
import { getSponsorsByMarathonIdQuery } from "@vimmer/api/db/queries/sponsors.queries";
import { Resource } from "sst";

const EventSchema = z.object({
  domain: z.string(),
  participantRef: z.string(),
});

export async function handler(event: SQSEvent) {
  const results = [];

  for (const record of event.Records) {
    try {
      const params = JSON.parse(record.body);

      const parsedParams = EventSchema.safeParse(params);
      if (!parsedParams.success) {
        throw new Error("Invalid event parameters");
      }

      const participant = await getParticipantByReferenceQuery(db, {
        reference: parsedParams.data.participantRef,
        domain: parsedParams.data.domain,
      });

      if (!participant) {
        throw new Error("Participant not found");
      }

      const sponsors = await getSponsorsByMarathonIdQuery(db, {
        marathonId: participant.marathonId,
      });

      const sponsorKey = sponsors
        .filter((s) => s.type === "contact-sheets")
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .at(-1)?.key;

      const topics = await getTopicsByDomainQuery(db, {
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

      const key = await createContactSheet({
        keys,
        participantRef: parsedParams.data.participantRef,
        domain: parsedParams.data.domain,
        sponsorPosition: "bottom-right",
        sponsorKey,
        topics: reducedTopics,
        currentContactSheetKey: participant.contactSheetKey,
      });

      await updateParticipantMutation(db, {
        id: participant.id,
        data: {
          contactSheetKey: key,
        },
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
