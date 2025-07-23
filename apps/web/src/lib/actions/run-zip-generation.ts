"use server";

import { actionClient } from "./safe-action";
import { task } from "sst/aws/task";
import { Resource } from "sst";
import { z } from "zod";

export const runZipGenerationAction = actionClient
  .schema(
    z.object({
      participantReference: z.string(),
      domain: z.string(),
      exportType: z.string(),
    }),
  )
  .action(
    async ({ parsedInput: { participantReference, domain, exportType } }) => {
      await task.run(Resource.GenerateParticipantZipTask, {
        PARTICIPANT_REFERENCE: participantReference,
        DOMAIN: domain,
        EXPORT_TYPE: exportType,
      });
      console.log("Zip generation task triggered");
    },
  );
