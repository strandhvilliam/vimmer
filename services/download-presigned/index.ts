import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { createClient } from "@vimmer/supabase/lambda";
import {
  getMarathonByDomainQuery,
  getParticipantsByDomainQuery,
  getZippedSubmissionsByDomainQuery,
} from "@vimmer/supabase/queries";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";
import type { LambdaFunctionURLEvent } from "aws-lambda";

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

  const marathon = await getMarathonByDomainQuery(supabase, domain);
  if (!marathon) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Marathon not found" }),
    };
  }

  const zippedSubmissions = await getZippedSubmissionsByDomainQuery(
    supabase,
    marathon.id
  );

  const exportsBucket = Resource.ExportsBucket.name;

  for (const zippedSubmission of zippedSubmissions) {
    if (!zippedSubmission.zipKey) {
      continue;
    }

    const command = new GetObjectCommand({
      Bucket: exportsBucket,
      Key: zippedSubmission.zipKey,
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
