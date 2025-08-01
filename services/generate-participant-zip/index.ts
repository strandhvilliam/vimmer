import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import JSZip from "jszip";
import path from "path";
import { Resource } from "sst";
import type {
  CompetitionClass,
  Participant,
  Submission,
  Topic,
} from "@vimmer/api/db/types";
import { db } from "@vimmer/api/db";
import { getMarathonByDomainQuery } from "@vimmer/api/db/queries/marathons.queries";
import { getParticipantByReferenceQuery } from "@vimmer/api/db/queries/participants.queries";
import { getTopicsByDomainQuery } from "@vimmer/api/db/queries/topics.queries";
import {
  createZippedSubmissionMutation,
  getZippedSubmissionByParticipantRefQuery,
  updateZippedSubmissionMutation,
} from "@vimmer/api/db/queries/submissions.queries";

const ZIP_EXPORT_TYPES = {
  ZIP_SUBMISSIONS: "zip_submissions",
  ZIP_THUMBNAILS: "zip_thumbnails",
  ZIP_PREVIEWS: "zip_previews",
} as const;

type ZipExportType = (typeof ZIP_EXPORT_TYPES)[keyof typeof ZIP_EXPORT_TYPES];

interface EventPayload {
  domain: string | undefined;
  exportType: ZipExportType | undefined;
  participantReference: string | undefined;
}

interface ExportConfig {
  domain: string;
  sourceBucket: string;
  destinationBucket: string;
  exportType: ZipExportType;
}

interface ProgressInfo {
  marathonId: number;
  zippedSubmissionId: number;
  exportType: ZipExportType;
  totalSubmissions: number;
  processedSubmissions: number;
  status: "pending" | "processing" | "completed" | "error";
  submissionErrors: Record<number, string>;
  zipKey: string;
}

interface ExportParticipantConfig extends ExportConfig {
  participantReference: string;
}

interface ProcessSubmissionParams {
  submission: Submission;
  exportType: ZipExportType;
  topics: Topic[];
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
  exportType: ZipExportType,
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

async function updateProgress(progress: ProgressInfo): Promise<void> {
  if (
    progress.status !== "error" &&
    (progress.zippedSubmissionId === 0 || progress.marathonId === 0)
  ) {
    throw new Error("Progress ID and marathon ID are required");
  }

  const percentProgress = Math.round(
    (progress.processedSubmissions / progress.totalSubmissions) * 100,
  );

  await updateZippedSubmissionMutation(db, {
    id: progress.zippedSubmissionId,
    data: {
      marathonId: progress.marathonId,
      progress: percentProgress,
      status: progress.status,
      errors: progress.submissionErrors,
      zipKey: progress.zipKey || undefined,
    },
  });
}

function validateParticipant(
  participant:
    | (Participant & {
        submissions: Submission[];
        competitionClass: CompetitionClass | null;
      })
    | null,
  participantReference: string,
) {
  if (!participant) {
    throw new Error(
      `Participant ${participantReference} with uploaded submissions not found`,
    );
  }

  if (
    !participant.submissions ||
    participant.submissions.length === 0 ||
    !participant.competitionClass
  ) {
    throw new Error(
      `Participant ${participantReference} has no uploaded submissions`,
    );
  }

  if (
    participant.competitionClass.numberOfPhotos !==
    participant.submissions.length
  ) {
    throw new Error(
      `Participant ${participantReference} has ${participant.submissions.length} submissions, but ${participant.competitionClass.numberOfPhotos} photos expected`,
    );
  }

  return participant;
}

async function fetchFileFromS3(
  s3Client: S3Client,
  bucket: string,
  key: string,
): Promise<Buffer | null> {
  const { Body } = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
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
  topics,
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
    const topicOrderIndex = topics.find(
      (topic) => topic.id === submission.topicId,
    )?.orderIndex;

    if (!topicOrderIndex && topicOrderIndex !== 0) {
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
    const zipPath = `${participant.reference}_${paddedTopicIndex}.${extension}`;

    const buffer = await fetchFileFromS3(s3Client, sourceBucket, fileKey);

    if (!buffer) {
      console.log("File not found");
      const updatedErrors = {
        ...updatedProgress.submissionErrors,
        [submission.id]: `File not found: ${fileKey}`,
      };

      return {
        progress: {
          ...updatedProgress,
          submissionErrors: updatedErrors,
          status: "error",
        },
        participantZip,
      };
    }
    console.log("File found");

    participantZip.file(zipPath, buffer, {
      binary: true,
      compression: "DEFLATE",
      compressionOptions: {
        level: 6,
      },
    });

    updatedProgress.processedSubmissions =
      updatedProgress.processedSubmissions + 1;

    await updateProgress(updatedProgress);

    return {
      progress: updatedProgress,
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
        status: "error",
        submissionErrors: updatedErrors,
      },
      participantZip,
    };
  }
}

async function processAllSubmissions(
  submissions: Submission[],
  params: Omit<ProcessSubmissionParams, "submission">,
): Promise<SubmissionResult> {
  let currentResult: SubmissionResult = {
    progress: params.progress,
    participantZip: params.participantZip,
  };

  for (const submission of submissions) {
    console.log("Processing submission", submission.id);
    currentResult = await processSubmission({
      ...params,
      submission,
      progress: currentResult.progress,
      participantZip: currentResult.participantZip,
    });

    if (currentResult.progress.status === "error") {
      break;
    }

    console.log("Finished processing submission", submission.id);
  }

  return currentResult;
}

async function exportParticipantSubmissionsToZip({
  domain,
  exportType,
  sourceBucket,
  destinationBucket,
  participantReference,
}: ExportParticipantConfig): Promise<string | null> {
  const s3Client = new S3Client();

  let progress: ProgressInfo = {
    marathonId: 0,
    zippedSubmissionId: 0,
    zipKey: "",
    exportType,
    totalSubmissions: 0,
    processedSubmissions: 0,
    status: "pending",
    submissionErrors: {},
  };

  console.log("initial progress", progress);

  try {
    const marathon = await getMarathonByDomainQuery(db, {
      domain,
    });
    if (!marathon) {
      throw new Error(`Marathon with domain ${domain} not found`);
    }

    const participantData = await getParticipantByReferenceQuery(db, {
      reference: participantReference,
      domain,
    });
    if (!participantData) {
      throw new Error(
        `Participant with reference ${participantReference} not found`,
      );
    }

    const participant = validateParticipant(
      participantData,
      participantReference,
    );

    let zippedSubmission = await getZippedSubmissionByParticipantRefQuery(db, {
      domain,
      participantRef: participantReference,
    });

    if (!zippedSubmission) {
      zippedSubmission = await createZippedSubmissionMutation(db, {
        data: {
          marathonId: marathon.id,
          exportType,
          participantId: participant.id,
        },
      });
    }

    if (!zippedSubmission) {
      throw new Error("Failed to create zipped submission");
    }

    progress.zippedSubmissionId = zippedSubmission.id;
    progress.marathonId = marathon.id;
    progress.totalSubmissions = participant.submissions.length;
    progress.status = "processing";

    await updateProgress(progress);

    const topics = await getTopicsByDomainQuery(db, {
      domain,
    });
    if (!topics) {
      throw new Error("No topics found for this marathon");
    }

    const participantZip = new JSZip();
    const date = new Date().toISOString().split("T")[0];
    const time = new Date().toISOString().split("T")[1]?.split(".")[0];
    const zipFileName = `${domain}/${participant.reference}.zip`;

    const result = await processAllSubmissions(participant.submissions, {
      exportType,
      topics,
      s3Client,
      sourceBucket,
      participantZip,
      progress,
      participant,
      domain,
    });

    if (result.progress.status === "error") {
      progress.submissionErrors = result.progress.submissionErrors;
      await updateProgress(progress);
      return null;
    }
    progress.processedSubmissions = result.progress.processedSubmissions;
    progress.status = "completed";

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
      }),
    );

    progress.zipKey = zipFileName;

    await updateProgress(progress);

    return zipFileName;
  } catch (error) {
    const errorProgress = { ...progress, status: "error" as const };
    await updateProgress(errorProgress);
    console.log("error", error);
    throw error;
  }
}

function validateEventPayload(payload: EventPayload): ExportParticipantConfig {
  const { domain, exportType, participantReference } = payload;

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

  if (!domain) throw new Error("domain is required");
  if (!sourceBucket) throw new Error("sourceBucket is required");
  if (!destinationBucket) throw new Error("destinationBucket is required");
  if (!participantReference)
    throw new Error("participantReference is required");

  return {
    domain,
    sourceBucket,
    destinationBucket,
    exportType,
    participantReference,
  };
}

async function main() {
  try {
    const domain = process.env.DOMAIN;
    const exportType = process.env.EXPORT_TYPE as
      | "zip_submissions"
      | "zip_thumbnails"
      | "zip_previews"
      | undefined;
    const participantReference = process.env.PARTICIPANT_REFERENCE;

    if (!domain || !exportType || !participantReference) {
      console.log("missing env", domain, exportType, participantReference);
      throw new Error(
        `Missing required environment variables: domain=${domain}, exportType=${exportType}, participantReference=${participantReference}`,
      );
    }

    const config = validateEventPayload({
      domain,
      exportType,
      participantReference,
    });

    await exportParticipantSubmissionsToZip(config);
  } catch (error) {
    console.error("Error processing record:", error);
    throw error;
  }
}

main();
