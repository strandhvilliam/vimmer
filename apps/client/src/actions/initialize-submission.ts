"use server";

import { actionClient, ActionError } from "@/utils/safe-action";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createMultipleSubmissions } from "@vimmer/supabase/mutations";
import {
  getCompetitionByDomain,
  getParticipantByReference,
} from "@vimmer/supabase/queries";
import { createClient } from "@vimmer/supabase/server";
import { InsertSubmission } from "@vimmer/supabase/types";
import { z } from "zod";

const BUCKET_NAME = "vimmer-development-submissionbucket-ccbsctdz";

const initializeSubmissionSchema = z.object({
  participantRef: z.string(),
  competitionDomain: z.string(),
});

export const initializeSubmission = actionClient
  .schema(initializeSubmissionSchema)
  .action(async ({ parsedInput }) => {
    const { participantRef, competitionDomain } = parsedInput;
    const supabase = await createClient();
    const s3 = new S3Client();

    const { data: competition, error: competitionError } =
      await getCompetitionByDomain(supabase, competitionDomain);

    if (competitionError) {
      throw new ActionError("Failed to get competition", competitionError);
    }
    if (!competition) {
      throw new ActionError("Competition not found");
    }

    const { data: participant, error: participantError } =
      await getParticipantByReference(supabase, participantRef);

    if (participantError) {
      throw new ActionError(
        `Failed to get participant "${participantRef}"`,
        participantError,
      );
    }
    if (!participant) {
      throw new ActionError(`Participant not found "${participantRef}"`);
    }

    //TODO: get noOfSubmissions from participantCompetitionClass
    const numberOfSubmissions = 2;

    const resp = await Promise.all(
      Array.from({ length: numberOfSubmissions }).map(async (_, index) => {
        const { originalKey } = formatSubmissionKey({
          ref: participantRef,
          index,
          domain: competitionDomain,
        });
        const cmd = new PutObjectCommand({
          Key: originalKey,
          //TODO: Get Bucket name from sst resource
          Bucket: BUCKET_NAME,
        });
        const presignedUrl = await getSignedUrl(s3, cmd);

        const dto: InsertSubmission = {
          participantId: participant.id,
          originalKey: originalKey,
        };
        return { presignedUrl, dto };
      }),
    );

    const { data: initializedSubmissions, error: initializeSubmissionError } =
      await createMultipleSubmissions(
        supabase,
        resp.map(({ dto }) => dto),
      );

    if (initializeSubmissionError) {
      throw new ActionError(
        "Failed to initialize submissions",
        initializeSubmissionError,
      );
    }
    if (initializedSubmissions.length === 0) {
      throw new ActionError("Failed to initialize submissions");
    }

    return resp.map(({ presignedUrl, dto }) => {
      const submission = initializedSubmissions.find(
        (s) => s.originalKey === dto.originalKey,
      );
      return {
        presignedUrl,
        submission,
      };
    });
  });

function formatSubmissionKey({
  ref,
  index,
  domain,
}: {
  domain: string;
  ref: string;
  index: number;
}) {
  const trimmedRef = ref.trim();
  const isOnlyDigits = /^\d+$/.test(trimmedRef);
  const displayRef = isOnlyDigits ? trimmedRef.padStart(4, "0") : trimmedRef;
  const displayIndex = (index + 1).toString().padStart(2, "0");
  const fileName = `${displayRef}_${displayIndex}.jpg`;
  const originalKey = `${domain}/original/${displayRef}/${displayIndex}/${fileName}`;
  return { originalKey };
}
