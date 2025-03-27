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
      REVALIDATE_SECRET: process.env.REVALIDATE_SECRET!,
    };

    const submissionBucket = new sst.aws.Bucket("SubmissionBucket", {
      access: "cloudfront",
    });
    const thumbnailBucket = new sst.aws.Bucket("ThumbnailBucket", {
      access: "cloudfront",
    });
    const previewBucket = new sst.aws.Bucket("PreviewBucket", {
      access: "cloudfront",
    });
    const marathonSettingsBucket = new sst.aws.Bucket(
      "MarathonSettingsBucket",
      {
        access: "cloudfront",
      }
    );

    new sst.aws.Router("VimmerBucketRouter", {
      routes: {
        "/submissions/*": {
          bucket: submissionBucket,
        },
        "/thumbnails/*": {
          bucket: thumbnailBucket,
        },
        "/previews/*": {
          bucket: previewBucket,
        },
        "/marathon-settings/*": {
          bucket: marathonSettingsBucket,
        },
      },
    });

    const processSubmissionQueue = new sst.aws.Queue("ProcessPhotoQueue");
    const photoValidatorFunction = new sst.aws.Function(
      "PhotoValidatorFunction",
      {
        handler: "lambdas/photo-validator/index.handler",
        environment: env,
        link: [submissionBucket],
        url: true,
      }
    );

    const clientApp = new sst.aws.Nextjs("ClientApp", {
      path: "apps/client",
      link: [submissionBucket],
    });

    const staffApp = new sst.aws.Nextjs("StaffApp", {
      path: "apps/staff",
    });

    const adminApp = new sst.aws.Nextjs("AdminApp", {
      path: "apps/admin",
    });

    new sst.aws.Cron("ScheduledTopicsCron", {
      function: {
        handler: "lambdas/scheduled-topics-cron/index.handler",
        environment: env,
        link: [adminApp],
      },
      schedule: "rate(1 minute)",
    });

    processSubmissionQueue.subscribe({
      handler: "./lambdas/photo-processor/index.handler",
      environment: env,
      link: [
        submissionBucket,
        thumbnailBucket,
        previewBucket,
        photoValidatorFunction,
      ],
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
        client: clientApp.url,
        staff: staffApp.url,
        admin: adminApp.url,
      },
      buckets: {
        submissionBucket: submissionBucket.name,
      },
      queues: {
        processSubmissionQueue: processSubmissionQueue.url,
      },
      lambdas: {
        photoValidatorFunction: photoValidatorFunction.url,
      },
    };
  },
});
