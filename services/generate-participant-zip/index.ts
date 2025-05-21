import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createClient } from "@vimmer/supabase/lambda";
import { Readable } from "stream";
import JSZip from "jszip";
import path from "path";
import { Resource } from "sst";
import type { Submission, SupabaseClient } from "@vimmer/supabase/types";
import {
  getMarathonByDomainQuery,
  getParticipantByReferenceQuery,
  getTopicsByDomainQuery,
} from "@vimmer/supabase/queries";
import type { SQSEvent } from "aws-lambda";

const ZIP_EXPORT_TYPES = {
  ZIP_SUBMISSIONS: "zip_submissions",
  ZIP_THUMBNAILS: "zip_thumbnails",
  ZIP_PREVIEWS: "zip_previews",
} as const;

type ZipExportType = (typeof ZIP_EXPORT_TYPES)[keyof typeof ZIP_EXPORT_TYPES];

interface EventPayload {
  domain: string;
  exportType: ZipExportType;
  zippedSubmissionId: number;
  participantReference: string;
}

interface ExportConfig {
  domain: string;
  sourceBucket: string;
  destinationBucket: string;
  exportType: ZipExportType;
  zippedSubmissionId: number;
}

interface ProgressInfo {
  marathonId: number;
  id: number;
  exportType: ZipExportType;
  totalSubmissions: number;
  processedSubmissions: number;
  status: "pending" | "processing" | "completed" | "error";
  submissionErrors: Record<number, string>;
}

interface ExportParticipantConfig extends ExportConfig {
  participantReference: string;
}

interface ProcessSubmissionParams {
  submission: Submission;
  exportType: ZipExportType;
  topicOrderMap: Map<number, number>;
  s3Client: S3Client;
  sourceBucket: string;
  participantZip: JSZip;
  progress: ProgressInfo;
  participant: any;
  domain: string;
}

interface SubmissionResult {
  progress: ProgressInfo;
  participantZip: JSZip;
}

function getKeyFromSubmission(
  submission: Partial<Submission>,
  exportType: ZipExportType
): string {
  const keyMap = {
    [ZIP_EXPORT_TYPES.ZIP_SUBMISSIONS]: submission.key,
    [ZIP_EXPORT_TYPES.ZIP_THUMBNAILS]: submission.thumbnailKey,
    [ZIP_EXPORT_TYPES.ZIP_PREVIEWS]: submission.previewKey,
  };

  const key = keyMap[exportType];

  if (!key) {
    throw new Error(`Key not found for submission: ${submission.id}`);
  }

  return key;
}

async function updateProgress(
  supabase: SupabaseClient,
  progress: ProgressInfo
): Promise<void> {
  if (progress.id === 0 || progress.marathonId === 0) {
    throw new Error("Progress ID and marathon ID are required");
  }

  const percentProgress = Math.round(
    (progress.processedSubmissions / progress.totalSubmissions) * 100
  );

  await supabase
    .from("zipped_submissions")
    .update({
      progress: percentProgress,
      status: progress.status,
      submissionErrors: progress.submissionErrors,
    })
    .eq("id", progress.id);
}

function validateParticipant(participant: any, participantReference: string) {
  if (!participant) {
    throw new Error(
      `Participant ${participantReference} with uploaded submissions not found`
    );
  }

  if (
    !participant.submissions ||
    participant.submissions.length === 0 ||
    !participant.competitionClass
  ) {
    throw new Error(
      `Participant ${participantReference} has no uploaded submissions`
    );
  }

  if (
    participant.competitionClass.numberOfPhotos !==
    participant.submissions.length
  ) {
    throw new Error(
      `Participant ${participantReference} has ${participant.submissions.length} submissions, but ${participant.competitionClass.numberOfPhotos} photos expected`
    );
  }

  return participant;
}

async function fetchFileFromS3(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<Buffer | null> {
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!Body || !(Body instanceof Readable)) {
    return null;
  }

  const chunks: Uint8Array[] = [];
  for await (const chunk of Body) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

async function processSubmission({
  submission,
  exportType,
  topicOrderMap,
  s3Client,
  sourceBucket,
  participantZip,
  progress,
  participant,
  domain,
}: ProcessSubmissionParams): Promise<SubmissionResult> {
  const updatedProgress = { ...progress };

  try {
    const fileKey = getKeyFromSubmission(submission, exportType);
    const topicOrderIndex = topicOrderMap.get(submission.topicId);

    if (!topicOrderIndex) {
      const updatedErrors = {
        ...updatedProgress.submissionErrors,
        [submission.id]: `Topic ID ${submission.topicId} not found in topics map for participant ${participant.id}`,
      };

      return {
        progress: {
          ...updatedProgress,
          submissionErrors: updatedErrors,
        },
        participantZip,
      };
    }

    const paddedTopicIndex = String(topicOrderIndex + 1).padStart(2, "0");
    const extension = path.extname(fileKey).slice(1) || "jpg";
    const zipPath = `${paddedTopicIndex}.${extension}`;

    const buffer = await fetchFileFromS3(s3Client, sourceBucket, fileKey);

    if (!buffer) {
      const updatedErrors = {
        ...updatedProgress.submissionErrors,
        [submission.id]: `File not found: ${fileKey}`,
      };

      return {
        progress: {
          ...updatedProgress,
          submissionErrors: updatedErrors,
        },
        participantZip,
      };
    }

    participantZip.file(zipPath, buffer, {
      binary: true,
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    return {
      progress: {
        ...updatedProgress,
        processedSubmissions: updatedProgress.processedSubmissions + 1,
      },
      participantZip,
    };
  } catch (error) {
    const updatedErrors = {
      ...updatedProgress.submissionErrors,
      [submission.id]: `Error processing submission ${submission.id} for participant ${participant.id}: ${error}`,
    };

    return {
      progress: {
        ...updatedProgress,
        submissionErrors: updatedErrors,
      },
      participantZip,
    };
  }
}

async function processAllSubmissions(
  submissions: Submission[],
  params: Omit<ProcessSubmissionParams, "submission">
): Promise<SubmissionResult> {
  let currentResult: SubmissionResult = {
    progress: params.progress,
    participantZip: params.participantZip,
  };

  for (const submission of submissions) {
    currentResult = await processSubmission({
      ...params,
      submission,
      progress: currentResult.progress,
      participantZip: currentResult.participantZip,
    });
  }

  return currentResult;
}

async function exportParticipantSubmissionsToZip({
  domain,
  exportType,
  sourceBucket,
  destinationBucket,
  zippedSubmissionId,
  participantReference,
}: ExportParticipantConfig): Promise<string | null> {
  const s3Client = new S3Client();
  const supabase = await createClient();

  let progress: ProgressInfo = {
    marathonId: 0,
    id: zippedSubmissionId,
    exportType,
    totalSubmissions: 0,
    processedSubmissions: 0,
    status: "pending",
    submissionErrors: {},
  };

  try {
    const marathon = await getMarathonByDomainQuery(supabase, domain);
    if (!marathon) {
      throw new Error(`Marathon with domain ${domain} not found`);
    }

    progress = { ...progress, marathonId: marathon.id };
    const participantData = await getParticipantByReferenceQuery(supabase, {
      reference: participantReference,
      domain,
    });

    const participant = validateParticipant(
      participantData,
      participantReference
    );

    progress = {
      ...progress,
      totalSubmissions: participant.submissions.length,
      status: "processing",
    };
    await updateProgress(supabase, progress);

    const topics = await getTopicsByDomainQuery(supabase, domain);
    if (!topics) {
      throw new Error("No topics found for this marathon");
    }
    const topicOrderMap = new Map(topics.map((t) => [t.id, t.orderIndex]));

    const participantZip = new JSZip();
    const zipFileName = `${domain}/${participant.reference}.zip`;

    const result = await processAllSubmissions(participant.submissions, {
      exportType,
      topicOrderMap,
      s3Client,
      sourceBucket,
      participantZip,
      progress,
      participant,
      domain,
    });

    result.participantZip.file(
      "manifest.json",
      JSON.stringify(
        {
          participantId: participant.id,
          reference: participant.reference,
          marathonId: marathon.id,
          domain,
          timestamp: new Date().toISOString(),
          submissionCount: participant.submissions.length,
        },
        null,
        2
      )
    );

    const zipBuffer = await result.participantZip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: destinationBucket,
        Key: zipFileName,
        Body: zipBuffer,
        ContentType: "application/zip",
      })
    );

    // Update final progress
    const finalProgress = {
      ...result.progress,
      processedSubmissions: result.progress.processedSubmissions + 1,
      status: "completed" as const,
    };
    await updateProgress(supabase, finalProgress);

    return zipFileName;
  } catch (error) {
    const errorProgress = { ...progress, status: "error" as const };
    await updateProgress(supabase, errorProgress);
    throw error;
  }
}

function validateEventPayload(payload: EventPayload): ExportParticipantConfig {
  const { domain, exportType, zippedSubmissionId, participantReference } =
    payload;

  if (
    !exportType ||
    !Object.values(ZIP_EXPORT_TYPES).includes(exportType as any)
  ) {
    throw new Error("Invalid export type");
  }

  const exportTypeToBucketMap = {
    [ZIP_EXPORT_TYPES.ZIP_SUBMISSIONS]: Resource.SubmissionBucket.name,
    [ZIP_EXPORT_TYPES.ZIP_THUMBNAILS]: Resource.ThumbnailBucket.name,
    [ZIP_EXPORT_TYPES.ZIP_PREVIEWS]: Resource.PreviewBucket.name,
  };

  const sourceBucket = exportTypeToBucketMap[exportType];
  const destinationBucket = Resource.ExportsBucket.name;

  if (!zippedSubmissionId) throw new Error("Zipped submission ID is required");
  if (!domain) throw new Error("domain is required");
  if (!sourceBucket) throw new Error("sourceBucket is required");
  if (!destinationBucket) throw new Error("destinationBucket is required");
  if (!participantReference)
    throw new Error("participantReference is required");

  return {
    zippedSubmissionId: +zippedSubmissionId,
    domain,
    sourceBucket,
    destinationBucket,
    exportType,
    participantReference,
  };
}

export const handler = async (event: SQSEvent): Promise<void> => {
  const processPromises = event.Records.map(async (record) => {
    try {
      const parsedBody = JSON.parse(record.body) as EventPayload;
      const config = validateEventPayload(parsedBody);
      const zipFileName = await exportParticipantSubmissionsToZip(config);

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Participant export completed successfully",
          zipFile: zipFileName,
        }),
      };
    } catch (error) {
      console.error("Error processing record:", error);
      throw error;
    }
  });

  await Promise.all(processPromises);
};
