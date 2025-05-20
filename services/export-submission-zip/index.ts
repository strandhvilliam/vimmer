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
import type { SupabaseClient } from "@vimmer/supabase/types";

interface ExportConfig {
  domain: string;
  sourceBucket: string;
  destinationBucket: string;
  exportType: "submissions" | "thumbnails" | "previews";
}

interface ProgressInfo {
  marathonId: number;
  id: number;
  exportType: "submissions" | "thumbnails" | "previews";
  totalParticipants: number;
  processedParticipants: number;
  totalSubmissions: number;
  processedSubmissions: number;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

const exportTypeToBucketMap = {
  submissions: Resource.SubmissionBucket.name,
  thumbnails: Resource.ThumbnailBucket.name,
  previews: Resource.PreviewBucket.name,
};

export async function exportSubmissionsToZip({
  domain,
  exportType,
  sourceBucket,
  destinationBucket,
}: ExportConfig): Promise<string> {
  const s3Client = new S3Client();
  const supabase = await createClient();

  let progress: ProgressInfo = {
    marathonId: 0,
    id: 0,
    exportType,
    totalParticipants: 0,
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

    const { data: zippedSubmission, error: zippedSubmissionError } =
      await supabase
        .from("zipped_submissions")
        .insert({
          marathon_id: marathon.id,
          export_type: exportType,
        })
        .select()
        .single();

    if (zippedSubmissionError) {
      throw new Error(
        `Failed to create zipped submission: ${zippedSubmissionError.message}`
      );
    }

    progress.id = zippedSubmission.id;

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

    updateProgress(supabase, progress);

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
    const zipFileName = `${domain}-${timestamp}.zip`;

    const masterZip = new JSZip();

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];

      if (!participant.submissions || participant.submissions.length === 0) {
        continue;
      }

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
          const paddedTopicIndex = String(topicOrderIndex + 1).padStart(2, "0");
          const extension =
            path.extname(submission.preview_key).slice(1) || "jpg";

          const zipPath = `${domain}/${participant.reference}/${participant.reference}_${paddedTopicIndex}.${extension}`;

          const { Body } = await s3Client.send(
            new GetObjectCommand({
              Bucket: sourceBucket,
              Key: submission.preview_key,
            })
          );

          if (!Body) {
            console.warn(`File not found: ${submission.preview_key}`);
            continue;
          }

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

          masterZip.file(zipPath, buffer, {
            binary: true,
            compression: "DEFLATE",
            compressionOptions: {
              level: 6, // moderate compression level
            },
          });

          progress.processedSubmissions++;
          updateProgress(supabase, progress);
        } catch (error) {
          console.error(`Error processing submission ${submission.id}:`, error);
        }
      }

      progress.processedParticipants++;
      updateProgress(supabase, progress);
    }

    const manifest = {
      marathonId: marathon.id,
      domain,
      timestamp: new Date().toISOString(),
      participantCount: participants.length,
      submissionCount: progress.totalSubmissions,
    };

    masterZip.file("manifest.json", JSON.stringify(manifest, null, 2));

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
    updateProgress(supabase, progress);

    return zipFileName;
  } catch (error) {
    progress.status = "error";
    progress.error = error instanceof Error ? error.message : String(error);
    updateProgress(supabase, progress);
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

export async function handler(): Promise<any> {
  try {
    const domain = process.env.DOMAIN;
    const exportType = process.env.EXPORT_TYPE as
      | "submissions"
      | "thumbnails"
      | "previews"
      | undefined;

    if (
      !exportType ||
      !["submissions", "thumbnails", "previews"].includes(exportType)
    ) {
      throw new Error("Invalid export type");
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

    const zipFileName = await exportSubmissionsToZip({
      domain,
      sourceBucket,
      destinationBucket,
      exportType,
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
