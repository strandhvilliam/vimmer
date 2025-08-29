"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Resource } from "sst";
import { getVerifiedParticipantsWithCompletePreviewKeysQuery } from "@vimmer/api/db/queries/participants.queries";
import { db } from "@vimmer/api/db";

export const runBulkSheetGenerationQueue = actionClient
  .schema(
    z.object({
      domain: z.string(),
    }),
  )
  .action(async ({ parsedInput: { domain } }) => {
    // Get all verified participants whose submissions have preview keys
    const readyParticipants =
      await getVerifiedParticipantsWithCompletePreviewKeysQuery(db, { domain });

    if (readyParticipants.length === 0) {
      console.log("No participants ready for bulk sheet generation");
      return {
        queued: 0,
        message: "No verified participants with complete preview keys found",
      };
    }

    const sqs = new SQSClient({ region: "eu-north-1" });
    let successCount = 0;
    let failureCount = 0;

    // Send batch messages to the queue
    for (const participant of readyParticipants) {
      try {
        await sqs.send(
          new SendMessageCommand({
            QueueUrl: Resource.ContactSheetGeneratorQueue.url,
            MessageBody: JSON.stringify({
              participantRef: participant.reference,
              domain,
            }),
          }),
        );
        successCount++;
        console.log(
          `✅ Queued sheet generation for participant ${participant.reference}`,
        );
      } catch (error) {
        failureCount++;
        console.error(
          `❌ Failed to queue sheet generation for participant ${participant.reference}:`,
          error,
        );
      }
    }

    console.log(
      `Bulk sheet generation completed: ${successCount} queued, ${failureCount} failed`,
    );

    return {
      queued: successCount,
      failed: failureCount,
      total: readyParticipants.length,
      message: `Successfully queued ${successCount} out of ${readyParticipants.length} participants for sheet generation`,
    };
  });
