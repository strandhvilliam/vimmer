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

    const vpc = new sst.aws.Vpc("VimmerVPC");
    const cluster = new sst.aws.Cluster("VimmerCluster", { vpc });

    const exportSubmissionsTask = new sst.aws.Task("ExportSubmissionsTask", {
      cluster,
      architecture: "arm64",
      image: {
        dockerfile: "./services/export-submission-zip/Dockerfile",
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

    const generateParticipantZipTask = new sst.aws.Task(
      "GenerateParticipantZipTask",
      {
        cluster,
        architecture: "arm64",
        image: {
          dockerfile: "./services/generate-participant-zip/Dockerfile",
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
      }
    );

    const exportCaller = new sst.aws.Function("ExportCaller", {
      handler: "services/export-caller/index.handler",
      environment: env,
      link: [exportSubmissionsTask, generateParticipantZipTask],
      url: true,
    });

    const downloadPresignedFunction = new sst.aws.Function(
      "DownloadPresignedFunction",
      {
        handler: "services/download-presigned/index.handler",
        environment: env,
        url: true,
        link: [exportsBucket],
      }
    );

    const processSubmissionQueue = new sst.aws.Queue("ProcessPhotoQueue");
    const validateSubmissionQueue = new sst.aws.Queue(
      "ValidateSubmissionQueue"
    );

    validateSubmissionQueue.subscribe({
      handler: "./services/photo-validator/index.handler",
      environment: env,
    });

    processSubmissionQueue.subscribe({
      handler: "./services/photo-processor/index.handler",
      environment: env,
      link: [
        submissionBucket,
        thumbnailBucket,
        previewBucket,
        validateSubmissionQueue,
        generateParticipantZipTask,
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

    const api = new sst.aws.Function("Api", {
      handler: "./apps/api/index.handler",
      url: true,
    });

    const clientApp = new sst.aws.Nextjs("ClientApp", {
      path: "./apps/client",
      dev: {
        command: "bun run dev --port 3000",
      },
      link: [
        submissionBucket,
        thumbnailBucket,
        previewBucket,
        exportsBucket,
        submissionsRouter,
        thumbnailsRouter,
        previewsRouter,
        marathonSettingsRouter,
      ],
    });

    const adminApp = new sst.aws.Nextjs("AdminApp", {
      path: "./apps/admin",
      dev: {
        command: "bun run dev --port 3001",
      },
      link: [
        submissionBucket,
        thumbnailBucket,
        previewBucket,
        exportsBucket,
        marathonSettingsBucket,
        submissionsRouter,
        thumbnailsRouter,
        previewsRouter,
        marathonSettingsRouter,
        clientApp,
      ],
    });

    return {
      apps: {
        client: clientApp.url,
        admin: adminApp.url,
        api: api.url,
      },
      buckets: {
        submissionBucket: submissionBucket.name,
        exportsBucket: exportsBucket.name,
      },
      queues: {
        processSubmissionQueue: processSubmissionQueue.url,
      },
      functions: {
        // photoValidatorFunction: photoValidatorFunction.url,
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
