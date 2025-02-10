/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "vimmer",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    };

    // submissionsbucket
    // thumbnailbucket
    // previewbucket

    const submissionBucket = new sst.aws.Bucket("SubmissionBucket", {
      access: "public",
    });
    const thumbnailBucket = new sst.aws.Bucket("ThumbnailBucket", {
      access: "public",
    });
    const previewBucket = new sst.aws.Bucket("PreviewBucket", {
      access: "public",
    });
    const processSubmissionQueue = new sst.aws.Queue("ProcessPhotoQueue");

    const clientApp = new sst.aws.Nextjs("ClientApp", {
      path: "apps/client",
      link: [submissionBucket],
    });

    processSubmissionQueue.subscribe({
      handler: "./functions/photo-processor/index.handler",
      environment: env,
      link: [submissionBucket, thumbnailBucket, previewBucket],
    });

    submissionBucket.notify({
      notifications: [
        {
          name: "SubmissionBucketNotification",
          queue: processSubmissionQueue,
          events: ["s3:ObjectCreated:*"],
        },
      ],
    });

    return {
      apps: {
        client: clientApp,
      },
      buckets: {
        submissionBucket: submissionBucket.name,
      },
      queues: {
        processSubmissionQueue: processSubmissionQueue.url,
      },
    };
  },
});
