"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  createMultipleSubmissions,
  updateParticipant,
} from "@vimmer/supabase/mutations";
import { createClient } from "@vimmer/supabase/server";
// import { Resource } from "sst";
import { initializeSubmissionsSchema } from "../schemas/initialize-submissions-schema";
import { actionClient, ActionError } from "./safe-action";
import {
  getMarathonByDomain,
  getCompetitionClassesByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { getManySubmissionsByKeysQuery } from "@vimmer/supabase/queries";

/**
 * @deprecated Use the /api/submissions endpoint with SWR instead
 */

export const initializeSubmission = actionClient
  .schema(initializeSubmissionsSchema)
  .action(
    async ({
      parsedInput: {
        participantRef,
        domain,
        participantId,
        competitionClassId,
      },
    }) => {
      const supabase = await createClient();
      const s3 = new S3Client({ region: "eu-north-1" });

      await updateParticipant(supabase, participantId, {
        uploadCount: 0,
      });

      const marathon = await getMarathonByDomain(domain);
      const competitionClasses = await getCompetitionClassesByDomain(domain);
      const topics = await getTopicsByDomain(domain);
      if (!marathon) {
        throw new ActionError("Marathon not found");
      }

      const competitionClass = competitionClasses.find(
        (cc) => cc.id === competitionClassId
      );
      if (!competitionClass) {
        throw new ActionError("Competition class not found");
      }
      const orderedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);
      const presignedObjects = await Promise.all(
        Array.from({ length: competitionClass.numberOfPhotos }).map(
          async (_, orderIndex) => {
            const topicId = orderedTopics[orderIndex]?.id;
            if (!topicId) {
              throw new ActionError("Unable to determine topic id");
            }
            const key = formatSubmissionKey({
              ref: participantRef,
              index: orderIndex,
              domain,
            });
            const presignedUrl = await generatePresignedUrl(s3, key);
            return { presignedUrl, key, orderIndex, topicId };
          }
        )
      );

      const existing = await getManySubmissionsByKeysQuery(
        supabase,
        presignedObjects.map((x) => x.key)
      );

      if (existing.length >= competitionClass.numberOfPhotos) {
        return presignedObjects.map((x) => ({
          ...x,
          submissionId: existing.find((s) => s.key === x.key)?.id,
        }));
      }
      const newSubmissions = await createMultipleSubmissions(
        supabase,
        presignedObjects
          .filter((po) => !existing.some((s) => s.key === po.key))
          .map(({ key, topicId }) => ({
            key,
            marathonId: marathon.id,
            participantId,
            topicId,
            status: "initialized",
          }))
      );
      return presignedObjects.map((x) => ({
        ...x,
        submissionId: newSubmissions.find((s) => s.key === x.key)?.id,
      }));
    }
  );

async function generatePresignedUrl(s3Client: S3Client, key: string) {
  try {
    return await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Key: key,
        Bucket: "vimmer-development-submissionbucketbucket-mssednck",
      })
    );
  } catch (error: unknown) {
    console.error(error);
    throw new ActionError(
      `Failed to generate presigned URL for submission ${key}. Please try again.`
    );
  }
}

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
  return `${domain}/${displayRef}/${displayIndex}/${fileName}`;
}
