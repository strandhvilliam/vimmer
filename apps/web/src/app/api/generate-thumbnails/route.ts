import { NextRequest, NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { generateImageVariants, getFileFromS3 } from "@vimmer/image-processing";
import { Resource } from "sst";
import { db } from "@vimmer/api/db";
import { updateSubmissionByIdMutation } from "@vimmer/api/db/queries/submissions.queries";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionIds } = body;

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json(
        { error: "submissionIds array is required" },
        { status: 400 },
      );
    }

    const s3Client = new S3Client({ region: "eu-north-1" });
    const results = [];

    for (const submissionId of submissionIds) {
      try {
        // Get submission from database
        const submission = await db.query.submissions.findFirst({
          where: (submissions, { eq }) => eq(submissions.id, submissionId),
        });

        if (!submission || !submission.key) {
          results.push({
            submissionId,
            success: false,
            error: "Submission not found or missing key",
          });
          continue;
        }

        // Skip if thumbnails already exist
        if (submission.thumbnailKey && submission.previewKey) {
          results.push({
            submissionId,
            success: true,
            message: "Thumbnails already exist",
          });
          continue;
        }

        // Get original image from S3
        const fileData = await getFileFromS3(
          s3Client,
          submission.key,
          Resource.SubmissionBucket.name,
        );

        if (!fileData) {
          results.push({
            submissionId,
            success: false,
            error: "Failed to fetch original image from S3",
          });
          continue;
        }

        // Generate thumbnails and previews
        const { thumbnailKey, previewKey } = await generateImageVariants(
          submission.key,
          fileData.file,
          s3Client,
          Resource.ThumbnailBucket.name,
          Resource.PreviewBucket.name,
        );

        if (!fileData) {
          results.push({
            submissionId,
            success: false,
            error: "Failed to fetch original image from S3",
          });
          continue;
        }

        // Generate thumbnails and previews
        const variants = await generateImageVariants(
          submission.key,
          fileData.file,
          s3Client,
          Resource.ThumbnailBucket.name,
          Resource.PreviewBucket.name,
        );

        // Update submission with new keys
        await updateSubmissionByIdMutation(db, {
          id: submissionId,
          data: {
            thumbnailKey: variants.thumbnailKey,
            previewKey: variants.previewKey,
          },
        });

        results.push({
          submissionId,
          success: true,
          thumbnailKey: variants.thumbnailKey,
          previewKey: variants.previewKey,
        });

        results.push({
          submissionId,
          success: true,
          thumbnailKey,
          previewKey,
        });
      } catch (error) {
        console.error(
          `Failed to generate thumbnails for submission ${submissionId}:`,
          error,
        );
        results.push({
          submissionId,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const errorCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: submissionIds.length,
        successful: successCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error("Error in generate-thumbnails API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
