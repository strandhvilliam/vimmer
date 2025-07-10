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

const ZIP_EXPORT_TYPES = {
  ZIP_SUBMISSIONS: "zip_submissions",
  ZIP_THUMBNAILS: "zip_thumbnails",
  ZIP_PREVIEWS: "zip_previews",
} as const;

interface ExportConfig {
  domain: string;
  sourceBucket: string;
  destinationBucket: string;
  exportType: (typeof ZIP_EXPORT_TYPES)[keyof typeof ZIP_EXPORT_TYPES];
  zippedSubmissionId: number;
}

interface ProgressInfo {
  marathonId: number;
  id: number;
  exportType: (typeof ZIP_EXPORT_TYPES)[keyof typeof ZIP_EXPORT_TYPES];
  totalParticipants: number;
  processedParticipants: number;
  totalSubmissions: number;
  processedSubmissions: number;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

const exportTypeToBucketMap = {
  [ZIP_EXPORT_TYPES.ZIP_SUBMISSIONS]: Resource.SubmissionBucket.name,
  [ZIP_EXPORT_TYPES.ZIP_THUMBNAILS]: Resource.ThumbnailBucket.name,
  [ZIP_EXPORT_TYPES.ZIP_PREVIEWS]: Resource.PreviewBucket.name,
} as const;

type ZipExportType = (typeof ZIP_EXPORT_TYPES)[keyof typeof ZIP_EXPORT_TYPES];

function getKeyFromSubmission(
  submission: Partial<Submission>,
  exportType: ZipExportType
) {
  let key: string | undefined | null;
  switch (exportType) {
    case ZIP_EXPORT_TYPES.ZIP_SUBMISSIONS:
      key = submission.key;
      break;
    case ZIP_EXPORT_TYPES.ZIP_THUMBNAILS:
      key = submission.thumbnailKey;
      break;
    case ZIP_EXPORT_TYPES.ZIP_PREVIEWS:
      key = submission.previewKey;
      break;
    default:
      throw new Error(`Invalid export type: ${exportType}`);
  }
  if (!key) {
    throw new Error(`Key not found for submission: ${submission.id}`);
  }
  return key;
}
export async function exportSubmissionsToZip({
  domain,
  exportType,
  sourceBucket,
  destinationBucket,
  zippedSubmissionId,
}: ExportConfig): Promise<string[]> {
  const s3Client = new S3Client();
  const supabase = await createClient();

  let progress: ProgressInfo = {
    marathonId: 0,
    id: zippedSubmissionId,
    exportType,
    totalParticipants: 0,
    processedParticipants: 0,
    totalSubmissions: 0,
    processedSubmissions: 0,
    status: "pending",
  };

  const zipFileNames: string[] = [];

  try {
    const { data: marathon, error: marathonError } = await supabase
      .from("marathons")
      .select()
      .eq("domain", domain)
      .single();

    if (marathonError || !marathon) {
      throw new Error(`Marathon with domain ${domain} not found`);
    }

    progress.marathonId = marathon.id;

    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select(
        `
        id,
        reference,
        submissions!inner(
          id,
          key,
          topic_id,
          status,
          preview_key,
          thumbnail_key
        )
      `
      )
      .eq("marathon_id", marathon.id)
      .eq("submissions.status", "uploaded");

    if (participantsError) {
      throw new Error(
        `Failed to fetch participants: ${participantsError.message}`
      );
    }

    if (!participants || participants.length === 0) {
      throw new Error("No participants with submissions found");
    }

    progress.totalParticipants = participants.length;
    progress.totalSubmissions = participants.reduce(
      (acc, p) => acc + (p.submissions?.length || 0),
      0
    );
    progress.status = "processing";

    await updateProgress(supabase, progress);

    const { data: topics } = await supabase
      .from("topics")
      .select("id, order_index")
      .eq("marathon_id", marathon.id);

    if (!topics) {
      throw new Error("No topics found for this marathon");
    }

    const topicOrderMap = new Map(topics.map((t) => [t.id, t.order_index]));
    const timestamp = new Date()
      .toISOString()
      .replace(/[:T]/g, "-")
      .split(".")[0];

    // Process one participant at a time
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];

      if (!participant?.submissions || participant.submissions.length === 0) {
        progress.processedParticipants++;
        await updateProgress(supabase, progress);
        continue;
      }

      // Create a new zip file for each participant
      const participantZip = new JSZip();
      const zipFileName = `${domain}/${participant.reference}.zip`;
      let hasSubmissions = false;

      for (const submission of participant.submissions) {
        if (
          submission.status !== "uploaded" ||
          !getKeyFromSubmission(submission, exportType)
        ) {
          continue;
        }

        const topicOrderIndex = topicOrderMap.get(submission.topic_id);
        if (topicOrderIndex === undefined) {
          console.warn(
            `Topic ID ${submission.topic_id} not found in topics map`
          );
          continue;
        }

        try {
          const paddedTopicIndex = String(topicOrderIndex + 1).padStart(2, "0");
          const extension =
            path
              .extname(getKeyFromSubmission(submission, exportType))
              .slice(1) || "jpg";
          const zipPath = `${paddedTopicIndex}.${extension}`;

          const { Body } = await s3Client.send(
            new GetObjectCommand({
              Bucket: sourceBucket,
              Key: getKeyFromSubmission(submission, exportType),
            })
          );

          if (!Body) {
            console.warn(
              `File not found: ${getKeyFromSubmission(submission, exportType)}`
            );
            continue;
          }

          const chunks: Uint8Array[] = [];
          if (Body instanceof Readable) {
            for await (const chunk of Body) {
              chunks.push(chunk);
            }
          } else {
            throw new Error(
              `Unexpected Body type for ${getKeyFromSubmission(
                submission,
                exportType
              )}`
            );
          }

          const buffer = Buffer.concat(chunks);

          participantZip.file(zipPath, buffer, {
            binary: true,
            compression: "DEFLATE",
            compressionOptions: {
              level: 6, // moderate compression level
            },
          });
          hasSubmissions = true;

          progress.processedSubmissions++;
          await updateProgress(supabase, progress);
        } catch (error) {
          console.error(`Error processing submission ${submission.id}:`, error);
        }
      }

      if (hasSubmissions) {
        const zipBuffer = await participantZip.generateAsync({
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

        zipFileNames.push(zipFileName);
      }

      progress.processedParticipants++;
      await updateProgress(supabase, progress);
    }

    // Create a manifest file with information about all the zips
    const manifestKey = `${domain}/${timestamp}-manifest.json`;
    const manifestContent = {
      marathonId: marathon.id,
      domain,
      timestamp: new Date().toISOString(),
      participantCount: participants.length,
      submissionCount: progress.totalSubmissions,
      zipFiles: zipFileNames,
    };

    await s3Client.send(
      new PutObjectCommand({
        Bucket: destinationBucket,
        Key: manifestKey,
        Body: JSON.stringify(manifestContent, null, 2),
        ContentType: "application/json",
      })
    );

    progress.status = "completed";
    await updateProgress(supabase, progress);

    return zipFileNames;
  } catch (error) {
    progress.status = "error";
    progress.error = error instanceof Error ? error.message : String(error);
    await updateProgress(supabase, progress);
    throw error;
  }
}

async function updateProgress(
  supabase: SupabaseClient,
  progress: ProgressInfo
) {
  if (progress.id === 0 || progress.marathonId === 0) {
    throw new Error("Progress ID and marathon ID are required");
  }

  const percentProgress = Math.round(
    (progress.processedParticipants / progress.totalParticipants) * 100
  );

  await supabase
    .from("zipped_submissions")
    .update({
      progress: percentProgress,
      status: progress.status,
      error: progress.error,
    })
    .eq("id", progress.id);
}

interface ExportParticipantConfig extends ExportConfig {
  participantId: number;
}

export async function exportParticipantSubmissionsToZip({
  domain,
  exportType,
  sourceBucket,
  destinationBucket,
  zippedSubmissionId,
  participantId,
}: ExportParticipantConfig): Promise<string | null> {
  const s3Client = new S3Client();
  const supabase = await createClient();

  let progress: ProgressInfo = {
    marathonId: 0,
    id: zippedSubmissionId,
    exportType,
    totalParticipants: 1, // Only one participant
    processedParticipants: 0,
    totalSubmissions: 0,
    processedSubmissions: 0,
    status: "pending",
  };

  try {
    const { data: marathon, error: marathonError } = await supabase
      .from("marathons")
      .select()
      .eq("domain", domain)
      .single();

    if (marathonError || !marathon) {
      throw new Error(`Marathon with domain ${domain} not found`);
    }

    progress.marathonId = marathon.id;

    const { data: participant, error: participantError } = await supabase
      .from("participants")
      .select(
        `
        id,
        reference,
        submissions!inner(
          id,
          key,
          topic_id,
          status,
          preview_key,
          thumbnail_key
        )
      `
      )
      .eq("marathon_id", marathon.id)
      .eq("id", participantId)
      .eq("submissions.status", "uploaded")
      .single();

    if (participantError) {
      throw new Error(
        `Failed to fetch participant ${participantId}: ${participantError.message}`
      );
    }

    if (!participant) {
      throw new Error(
        `Participant ${participantId} with uploaded submissions not found`
      );
    }

    if (!participant.submissions || participant.submissions.length === 0) {
      progress.status = "completed"; // No submissions to process
      await updateProgress(supabase, progress);
      return null; // Or throw an error, depending on desired behavior
    }

    progress.totalSubmissions = participant.submissions.length;
    progress.status = "processing";
    await updateProgress(supabase, progress);

    const { data: topics } = await supabase
      .from("topics")
      .select("id, order_index")
      .eq("marathon_id", marathon.id);

    if (!topics) {
      throw new Error("No topics found for this marathon");
    }

    const topicOrderMap = new Map(topics.map((t) => [t.id, t.order_index]));

    const participantZip = new JSZip();
    const zipFileName = `${domain}/${participant.reference}.zip`;
    let hasSubmissions = false;

    for (const submission of participant.submissions) {
      if (
        submission.status !== "uploaded" ||
        !getKeyFromSubmission(submission, exportType)
      ) {
        continue;
      }

      const topicOrderIndex = topicOrderMap.get(submission.topic_id);
      if (topicOrderIndex === undefined) {
        console.warn(
          `Topic ID ${submission.topic_id} not found in topics map for participant ${participant.id}`
        );
        continue;
      }

      try {
        const paddedTopicIndex = String(topicOrderIndex + 1).padStart(2, "0");
        const extension =
          path.extname(getKeyFromSubmission(submission, exportType)).slice(1) ||
          "jpg";
        const zipPath = `${paddedTopicIndex}.${extension}`;

        const { Body } = await s3Client.send(
          new GetObjectCommand({
            Bucket: sourceBucket,
            Key: getKeyFromSubmission(submission, exportType),
          })
        );

        if (!Body) {
          console.warn(
            `File not found: ${getKeyFromSubmission(submission, exportType)}`
          );
          continue;
        }

        const chunks: Uint8Array[] = [];
        if (Body instanceof Readable) {
          for await (const chunk of Body) {
            chunks.push(chunk);
          }
        } else {
          throw new Error(
            `Unexpected Body type for ${getKeyFromSubmission(
              submission,
              exportType
            )}`
          );
        }

        const buffer = Buffer.concat(chunks);

        participantZip.file(zipPath, buffer, {
          binary: true,
          compression: "DEFLATE",
          compressionOptions: {
            level: 6,
          },
        });
        hasSubmissions = true;
        progress.processedSubmissions++;
        // No need to update progress for each submission in single participant mode for now
        // Consider if sub-progress is needed.
      } catch (error) {
        console.error(
          `Error processing submission ${submission.id} for participant ${participant.id}:`,
          error
        );
        // Potentially update progress with error for this specific submission if needed
      }
    }

    if (hasSubmissions) {
      const manifest = {
        participantId: participant.id,
        reference: participant.reference,
        marathonId: marathon.id,
        domain,
        timestamp: new Date().toISOString(),
        submissionCount: participant.submissions.length,
      };

      participantZip.file("manifest.json", JSON.stringify(manifest, null, 2));

      const zipBuffer = await participantZip.generateAsync({
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

      progress.processedParticipants++;
      progress.status = "completed";
      await updateProgress(supabase, progress);
      return zipFileName;
    } else {
      // No valid submissions were processed
      progress.processedParticipants++;
      progress.status = "completed"; // Or "error" if no submissions is an error state
      await updateProgress(supabase, progress);
      return null;
    }
  } catch (error) {
    progress.status = "error";
    progress.error = error instanceof Error ? error.message : String(error);
    await updateProgress(supabase, progress); // Ensure progress is updated on error
    throw error;
  }
}

export async function handler(): Promise<any> {
  try {
    const domain = process.env.DOMAIN;
    const zippedSubmissionId = process.env.ZIPPED_SUBMISSIONS_ID;
    const exportType = process.env.EXPORT_TYPE as
      | "zip_submissions"
      | "zip_thumbnails"
      | "zip_previews"
      | undefined;
    const participantId = process.env.PARTICIPANT_ID; // New environment variable

    if (
      !exportType ||
      !["zip_submissions", "zip_thumbnails", "zip_previews"].includes(
        exportType
      )
    ) {
      throw new Error("Invalid export type");
    }

    if (!zippedSubmissionId) {
      throw new Error("Zipped submission ID is required");
    }

    const sourceBucket = exportTypeToBucketMap[exportType];

    const destinationBucket = Resource.ExportsBucket.name;

    if (!domain) {
      throw new Error("domain is required");
    }

    if (!sourceBucket) {
      throw new Error("sourceBucket is required");
    }

    if (!destinationBucket) {
      throw new Error("destinationBucket is required");
    }

    if (participantId) {
      // If participantId is provided, call the new function
      const zipFileName = await exportParticipantSubmissionsToZip({
        zippedSubmissionId: +zippedSubmissionId,
        domain,
        sourceBucket,
        destinationBucket,
        exportType,
        participantId: +participantId,
      });
      if (zipFileName) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Participant export completed successfully",
            zipFile: zipFileName,
          }),
        };
      } else {
        return {
          statusCode: 200, // Or another appropriate code if no zip was created but no error
          body: JSON.stringify({
            message:
              "Participant export completed. No submissions to zip or participant not found.",
          }),
        };
      }
    } else {
      // Call the original function for all participants
      const zipFileNames = await exportSubmissionsToZip({
        zippedSubmissionId: +zippedSubmissionId,
        domain,
        sourceBucket,
        destinationBucket,
        exportType,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Export completed successfully",
          zipFileCount: zipFileNames.length,
        }),
      };
    }
  } catch (error) {
    console.error("Export error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Export failed",
        error: error instanceof Error ? error.message : String(error),
      }),
    };
  }
}

handler();
