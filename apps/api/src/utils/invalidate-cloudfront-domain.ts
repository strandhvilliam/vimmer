import {
  CloudFrontClient,
  CreateInvalidationCommand,
} from "@aws-sdk/client-cloudfront";

const SUBMISSION_DISTRIBUTION_ID = process.env.SUBMISSION_DISTRIBUTION_ID;
const PREVIEW_DISTRIBUTION_ID = process.env.PREVIEW_DISTRIBUTION_ID;
const THUMBNAIL_DISTRIBUTION_ID = process.env.THUMBNAIL_DISTRIBUTION_ID;

export async function invalidateCloudfrontByDomain(domain: string) {
  if (
    !SUBMISSION_DISTRIBUTION_ID ||
    !PREVIEW_DISTRIBUTION_ID ||
    !THUMBNAIL_DISTRIBUTION_ID
  ) {
    throw new Error("No Cloudfront distribution IDs found");
  }

  const cf = new CloudFrontClient();
  const paths = [`/${domain}/*`];
  await Promise.all([
    createInvalidation(cf, SUBMISSION_DISTRIBUTION_ID, paths),
    createInvalidation(cf, PREVIEW_DISTRIBUTION_ID, paths),
    createInvalidation(cf, THUMBNAIL_DISTRIBUTION_ID, paths),
  ]);
}

async function createInvalidation(
  cfClient: CloudFrontClient,
  distributionId: string,
  paths: string[],
) {
  const invalidationTimestamp = Date.now().toString();
  const invalidation = await cfClient.send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: invalidationTimestamp,
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
      },
    }),
  );

  return invalidation;
}
