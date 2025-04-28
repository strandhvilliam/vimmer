import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createClient } from "@vimmer/supabase/lambda";
import { Readable } from "stream";
import JSZip from "jszip";
import path from "path";
import type { Tables } from "@vimmer/supabase/types";

const MAX_FILES_PER_BATCH = 50;

type MarathonId = number;
type SubmissionWithMetadata = Tables<"submissions"> & {
  participant: Pick<Tables<"participants">, "reference">;
  topic: Pick<Tables<"topics">, "order_index">;
};

interface ExportConfig {
  marathonId: MarathonId;
  sourceBucket: string;
  destinationBucket: string;
  progressCallback?: (progress: ProgressInfo) => void;
}

interface ProgressInfo {
  totalParticipants: number;
  processedParticipants: number;
  totalSubmissions: number;
  processedSubmissions: number;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

export async function exportSubmissionsToZip({
  marathonId,
  sourceBucket,
  destinationBucket,
  progressCallback,
}: ExportConfig): Promise<string> {
  const s3Client = new S3Client();
  const supabase = await createClient();

  let progress: ProgressInfo = {
    totalParticipants: 0,
    processedParticipants: 0,
    totalSubmissions: 0,
    processedSubmissions: 0,
    status: "pending",
  };

  try {
    // Get the marathon details to know the domain
    const { data: marathon } = await supabase
      .from("marathons")
      .select("domain")
      .eq("id", marathonId)
      .single();

    if (!marathon) {
      throw new Error(`Marathon with ID ${marathonId} not found`);
    }

    const domain = marathon.domain;

    // Get all participants with submissions for this marathon
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
          preview_key
        )
      `
      )
      .eq("marathon_id", marathonId)
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
    updateProgress(progress, progressCallback);

    // Get all topics for this marathon
    const { data: topics } = await supabase
      .from("topics")
      .select("id, order_index")
      .eq("marathon_id", marathonId);

    if (!topics) {
      throw new Error("No topics found for this marathon");
    }

    // Create a mapping of topic IDs to order indices
    const topicOrderMap = new Map(topics.map((t) => [t.id, t.order_index]));

    // Generate a timestamp for the zip file name
    const timestamp = new Date()
      .toISOString()
      .replace(/[:T]/g, "-")
      .split(".")[0];
    const zipFileName = `${domain}-submissions-${timestamp}.zip`;

    // Process participants in batches to handle large datasets
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      const zip = new JSZip();

      if (!participant.submissions || participant.submissions.length === 0) {
        continue;
      }

      // Process submissions for this participant
      for (const submission of participant.submissions) {
        if (submission.status !== "uploaded" || !submission.preview_key) {
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
          // Format the order index with padding (01, 02, etc.)
          const paddedTopicIndex = String(topicOrderIndex + 1).padStart(2, "0");

          // Get file extension from the key
          const extension =
            path.extname(submission.preview_key).slice(1) || "jpg";

          // Define the destination path within the zip
          const zipPath = `${domain}/${participant.reference}/${paddedTopicIndex}.${extension}`;

          // Download the submission file from S3
          const { Body, ContentType } = await s3Client.send(
            new GetObjectCommand({
              Bucket: sourceBucket,
              Key: submission.preview_key,
            })
          );

          if (!Body) {
            console.warn(`File not found: ${submission.preview_key}`);
            continue;
          }

          // Convert the readable stream to a buffer
          const chunks: Uint8Array[] = [];
          if (Body instanceof Readable) {
            for await (const chunk of Body) {
              chunks.push(chunk);
            }
          } else {
            throw new Error(
              `Unexpected Body type for ${submission.preview_key}`
            );
          }

          const buffer = Buffer.concat(chunks);

          // Add the file to the zip
          zip.file(zipPath, buffer, {
            binary: true,
            compression: "DEFLATE",
            compressionOptions: {
              level: 6, // moderate compression level
            },
          });

          progress.processedSubmissions++;
          updateProgress(progress, progressCallback);
        } catch (error) {
          console.error(`Error processing submission ${submission.id}:`, error);
        }
      }

      // Generate the zip file for this batch
      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        streamFiles: true,
        compression: "DEFLATE",
      });

      // Upload the zip to the destination bucket
      const participantZipKey = `${domain}/${participant.reference}.zip`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: destinationBucket,
          Key: participantZipKey,
          Body: zipBuffer,
          ContentType: "application/zip",
        })
      );

      progress.processedParticipants++;
      updateProgress(progress, progressCallback);
    }

    // Now create a master zip containing all participant zips
    const masterZip = new JSZip();

    // Create a manifest file with information about the export
    const manifest = {
      marathonId,
      domain,
      timestamp: new Date().toISOString(),
      participantCount: participants.length,
      submissionCount: progress.totalSubmissions,
    };

    masterZip.file("manifest.json", JSON.stringify(manifest, null, 2));

    // Upload the master zip
    const masterZipBuffer = await masterZip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: destinationBucket,
        Key: zipFileName,
        Body: masterZipBuffer,
        ContentType: "application/zip",
      })
    );

    progress.status = "completed";
    updateProgress(progress, progressCallback);

    return zipFileName;
  } catch (error) {
    progress.status = "error";
    progress.error = error instanceof Error ? error.message : String(error);
    updateProgress(progress, progressCallback);
    throw error;
  }
}

function updateProgress(
  progress: ProgressInfo,
  callback?: (progress: ProgressInfo) => void
) {
  if (callback) {
    callback({ ...progress });
  }
}

export async function handler(): Promise<any> {
  try {
    const marathonId = 2;
    const sourceBucket = "vimmer-development-previewbucketbucket-thecfkbk";
    const destinationBucket = "vimmer-development-exportsbucketbucket-wdhoedum";

    if (!marathonId) {
      throw new Error("marathonId is required");
    }

    if (!sourceBucket) {
      throw new Error("sourceBucket is required");
    }

    if (!destinationBucket) {
      throw new Error("destinationBucket is required");
    }

    const zipFileName = await exportSubmissionsToZip({
      marathonId,
      sourceBucket,
      destinationBucket,
      progressCallback: (progress) => {
        console.log("Export progress:", JSON.stringify(progress, null, 2));
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Export completed successfully",
        zipFileName,
      }),
    };
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
