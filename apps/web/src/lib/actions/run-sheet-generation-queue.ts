"use server";

import { z } from "zod";
import { actionClient } from "./safe-action";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Resource } from "sst";

export const runSheetGenerationQueue = actionClient
  .schema(
    z.object({
      participantRef: z.string(),
      domain: z.string(),
    }),
  )
  .action(async ({ parsedInput: { participantRef, domain } }) => {
    const sqs = new SQSClient({ region: "eu-north-1" });
    const result = await sqs.send(
      new SendMessageCommand({
        QueueUrl: Resource.ContactSheetGeneratorQueue.url,
        MessageBody: JSON.stringify({
          participantRef,
          domain,
        }),
      }),
    );
    console.log("Zip generation task triggered with result", result);
  });
