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

    const exportsBucket = new sst.aws.Bucket("ExportsBucket", {
      access: "public",
    });

    const submissionsRouter = new sst.aws.Router("SubmissionsRouter", {
      routes: {
        "/*": {
          bucket: submissionBucket,
        },
      },
    });

    const thumbnailsRouter = new sst.aws.Router("ThumbnailsRouter", {
      routes: {
        "/*": {
          bucket: thumbnailBucket,
        },
      },
    });

    const previewsRouter = new sst.aws.Router("PreviewsRouter", {
      routes: {
        "/*": {
          bucket: previewBucket,
        },
      },
    });

    const marathonSettingsRouter = new sst.aws.Router(
      "MarathonSettingsRouter",
      {
        routes: {
          "/*": {
            bucket: marathonSettingsBucket,
          },
        },
      }
    );

    const processSubmissionQueue = new sst.aws.Queue("ProcessPhotoQueue");
    const photoValidatorFunction = new sst.aws.Function(
      "PhotoValidatorFunction",
      {
        handler: "services/photo-validator/index.handler",
        environment: env,
        link: [submissionBucket],
        url: true,
      }
    );

    const downloadPresignedFunction = new sst.aws.Function(
      "DownloadPresignedFunction",
      {
        handler: "services/download-presigned/index.handler",
        environment: env,
        url: true,
        link: [exportsBucket],
      }
    );

    const vpc = new sst.aws.Vpc("VimmerVPC");
    const cluster = new sst.aws.Cluster("VimmerCluster", { vpc });

    const exportSubmissionsTask = new sst.aws.Task("ExportSubmissionsTask", {
      cluster,
      image: {
        context: "./services/export-submission-zip",
        dockerfile: "Dockerfile",
      },
      environment: env,
      link: [submissionBucket, thumbnailBucket, previewBucket, exportsBucket],
      permissions: [
        {
          actions: ["s3:GetObject", "s3:PutObject"],
          resources: [previewBucket.arn, exportsBucket.arn],
        },
      ],
      dev: {
        command: "bun start",
      },
    });

    const exportCaller = new sst.aws.Function("ExportCaller", {
      handler: "services/export-caller/index.handler",
      environment: env,
      link: [exportSubmissionsTask],
      url: true,
    });

    const generateParticipantZipQueue = new sst.aws.Queue(
      "GenerateParticipantZipQueue"
    );

    generateParticipantZipQueue.subscribe({
      handler: "./services/generate-participant-zip/index.handler",
      environment: env,
      link: [submissionBucket, thumbnailBucket, previewBucket, exportsBucket],
    });

    // new sst.aws.Cron("ScheduledTopicsCron", {
    //   function: {
    //     handler: "services/scheduled-topics-cron/index.handler",
    //     environment: env,
    //     // link: [adminApp],
    //   },
    //   schedule: "rate(1 minute)",
    // });

    processSubmissionQueue.subscribe({
      handler: "./services/photo-processor/index.handler",
      environment: env,
      link: [
        submissionBucket,
        thumbnailBucket,
        previewBucket,
        photoValidatorFunction,
      ],
      permissions: [
        {
          actions: ["s3:GetObject", "s3:PutObject"],
          resources: [
            submissionBucket.arn,
            thumbnailBucket.arn,
            previewBucket.arn,
          ],
        },
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
        // client: clientApp.url,
        // staff: staffApp.url,
        // admin: adminApp.url,
      },
      buckets: {
        submissionBucket: submissionBucket.name,
        exportsBucket: exportsBucket.name,
      },
      queues: {
        processSubmissionQueue: processSubmissionQueue.url,
      },
      functions: {
        photoValidatorFunction: photoValidatorFunction.url,
        exportSubmissionsTask: exportSubmissionsTask.urn,
        exportCaller: exportCaller.url,
        downloadPresignedFunction: downloadPresignedFunction.url,
      },
      routers: {
        submissionsRouter: submissionsRouter.url,
        thumbnailsRouter: thumbnailsRouter.url,
        previewsRouter: previewsRouter.url,
        marathonSettingsRouter: marathonSettingsRouter.url,
      },
    };
  },
});
