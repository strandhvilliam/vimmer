import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@vimmer/supabase/lambda";
import { getParticipantsByDomainQuery } from "@vimmer/supabase/queries";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";
import type { LambdaFunctionURLEvent, SQSEvent } from "aws-lambda";

interface DownloadPresignedRequest {
  domain: string;
}

export const handler = async (event: LambdaFunctionURLEvent) => {
  const s3Client = new S3Client();
  const supabase = await createClient();

  const domain = event.queryStringParameters?.domain;
  if (!domain) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing domain" }),
    };
  }

  let presignedUrlPromises: Promise<string>[] = [];

  const participants = await getParticipantsByDomainQuery(supabase, domain);

  const exportsBucket = Resource.ExportsBucket.name;

  for (const participant of participants) {
    const command = new GetObjectCommand({
      Bucket: exportsBucket,
      Key: `${domain}/${participant.reference}.zip`,
    });

    const presignedUrl = getSignedUrl(s3Client, command, {
      expiresIn: 60 * 60 * 24, // 1 day
    });

    presignedUrlPromises.push(presignedUrl);
  }

  const presignedUrls = await Promise.all(presignedUrlPromises);

  return {
    statusCode: 200,
    body: JSON.stringify({
      presignedUrls,
    }),
  };
};
