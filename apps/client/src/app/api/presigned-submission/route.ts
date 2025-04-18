import { S3Client } from "@aws-sdk/client-s3";
import { createClient } from "@vimmer/supabase/server";
import { AWS_CONFIG } from "@/config/aws";
import { PresignedSubmissionService } from "./service";
import { presignedSubmissionQuerySchema } from "./types";

export async function GET(request: Request) {
  try {
    console.log("GET request received");
    const { searchParams } = new URL(request.url);
    const queryParams = {
      participantRef: searchParams.get("participantRef"),
      domain: searchParams.get("domain"),
      participantId: searchParams.get("participantId"),
      competitionClassId: searchParams.get("competitionClassId"),
    };

    const result = presignedSubmissionQuerySchema.safeParse(queryParams);
    if (!result.success) {
      return Response.json(
        { error: "Invalid or missing parameters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const s3 = new S3Client({ region: AWS_CONFIG.region });

    const service = new PresignedSubmissionService(supabase, s3);

    const presignedSubmissions = await service.generatePresignedSubmissions(
      result.data.participantRef,
      result.data.domain,
      result.data.participantId,
      result.data.competitionClassId
    );

    return Response.json(presignedSubmissions);
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
