import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  createMultipleSubmissions,
  updateParticipant,
} from "@vimmer/supabase/mutations";
import { createClient } from "@vimmer/supabase/server";
import {
  getMarathonByDomain,
  getCompetitionClassesByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { getManySubmissionsByKeysQuery } from "@vimmer/supabase/queries";
import { formatSubmissionKey } from "@/lib/utils";

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
    throw new Error(`Failed to generate presigned URL for submission ${key}`);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const participantRef = searchParams.get("participantRef");
    const domain = searchParams.get("domain");
    const participantId = searchParams.get("participantId");
    const competitionClassId = searchParams.get("competitionClassId");

    if (!participantRef || !domain || !participantId || !competitionClassId) {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const s3 = new S3Client({ region: "eu-north-1" });

    // Get required data
    const marathon = await getMarathonByDomain(domain);
    const competitionClasses = await getCompetitionClassesByDomain(domain);
    const topics = await getTopicsByDomain(domain);

    if (!marathon) {
      return Response.json({ error: "Marathon not found" }, { status: 404 });
    }

    const competitionClass = competitionClasses.find(
      (cc) => cc.id === parseInt(competitionClassId)
    );
    if (!competitionClass) {
      return Response.json(
        { error: "Competition class not found" },
        { status: 404 }
      );
    }

    // Sort topics by order index
    const orderedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);

    // Generate submission keys based on the required number of photos
    const submissionKeys = Array.from({
      length: competitionClass.numberOfPhotos,
    }).map((_, index) => {
      return formatSubmissionKey({
        ref: participantRef,
        index,
        domain,
      });
    });

    // Check if submissions already exist
    const existingSubmissions = await getManySubmissionsByKeysQuery(
      supabase,
      submissionKeys
    );

    // Create new submissions if needed
    if (existingSubmissions.length < competitionClass.numberOfPhotos) {
      await updateParticipant(supabase, parseInt(participantId), {
        uploadCount: 0,
      });

      // Filter out keys that already have submissions
      const keysToCreate = submissionKeys.filter(
        (key) =>
          !existingSubmissions.some((submission) => submission.key === key)
      );

      // Create submissions for missing keys
      const newSubmissions = await createMultipleSubmissions(
        supabase,
        keysToCreate.map((key, i) => {
          // Find the index of this key in the original array to get the correct topic
          const originalIndex = submissionKeys.findIndex((k) => k === key);
          const topicId = orderedTopics[originalIndex]?.id;

          if (!topicId) {
            throw new Error(
              `Unable to determine topic id for submission at index ${originalIndex}`
            );
          }

          return {
            key,
            marathonId: marathon.id,
            participantId: parseInt(participantId),
            topicId,
            status: "initialized",
          };
        })
      );

      // Combine existing and new submissions
      const allSubmissions = [...existingSubmissions, ...newSubmissions];

      // Generate presigned URLs for all submissions
      const presignedObjects = await Promise.all(
        allSubmissions.map(async (submission) => {
          const orderIndex = orderedTopics.findIndex(
            (t) => t.id === submission.topicId
          );
          const presignedUrl = await generatePresignedUrl(s3, submission.key);
          return {
            presignedUrl,
            key: submission.key,
            orderIndex,
            topicId: submission.topicId,
            submissionId: submission.id,
          };
        })
      );

      // Sort by order index
      const sortedObjects = presignedObjects.sort(
        (a, b) => a.orderIndex - b.orderIndex
      );
      return Response.json(sortedObjects);
    }

    // If all submissions already exist, just generate presigned URLs
    const presignedObjects = await Promise.all(
      existingSubmissions.map(async (submission) => {
        const orderIndex = orderedTopics.findIndex(
          (t) => t.id === submission.topicId
        );
        const presignedUrl = await generatePresignedUrl(s3, submission.key);
        return {
          presignedUrl,
          key: submission.key,
          orderIndex,
          topicId: submission.topicId,
          submissionId: submission.id,
        };
      })
    );

    // Sort by order index
    const sortedObjects = presignedObjects.sort(
      (a, b) => a.orderIndex - b.orderIndex
    );
    return Response.json(sortedObjects);
  } catch (error) {
    console.error("Submission initialization error:", error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
