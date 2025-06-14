"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const logoUploadSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
});

const bucket = "vimmer-development-marathonsettingsbucketbucket-huvkamue";
const CDN_URL = "https://d1irn00yzrui1x.cloudfront.net";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = logoUploadSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { fileName, contentType } = result.data;

    // Generate a unique key for the logo
    const timestamp = Date.now();
    const key = `onboarding/logos/${timestamp}-${fileName}`;

    const s3 = new S3Client({ region: "eu-north-1" });
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    const publicUrl = `${CDN_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error("Failed to generate presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
