/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "vimmer",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    }
  },
  async run() {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
      NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      REVALIDATE_SECRET: process.env.REVALIDATE_SECRET!,
      DATABASE_URL: process.env.DATABASE_URL!,
      JURY_JWT_SECRET: process.env.JURY_JWT_SECRET!,
      TEMP_ENV: "true",
    }

    const allowOrigins =
      process.env.SUBMISSION_BUCKETS_ALLOW_ORIGINS?.split(",") ?? []

    const submissionBucket = new sst.aws.Bucket("SubmissionBucket", {
      access: "cloudfront",
      cors: {
        allowOrigins,
        allowMethods: ["GET", "HEAD", "PUT"],
        allowHeaders: ["*"],
        exposeHeaders: ["Access-Control-Allow-Origin"],
      },
    })
    const thumbnailBucket = new sst.aws.Bucket("ThumbnailBucket", {
      access: "cloudfront",
      cors: {
        allowOrigins,
        allowMethods: ["PUT"],
        allowHeaders: ["*"],
      },
    })
    const previewBucket = new sst.aws.Bucket("PreviewBucket", {
      access: "cloudfront",
      cors: {
        allowOrigins,
        allowMethods: ["PUT"],
        allowHeaders: ["*"],
      },
    })
    const marathonSettingsBucket = new sst.aws.Bucket(
      "MarathonSettingsBucket",
      {
        access: "cloudfront",
        cors: {
          allowOrigins,
        },
      }
    )

    const contactSheetsBucket = new sst.aws.Bucket("ContactSheetsBucket", {
      access: "public",
    })

    const realtime = new sst.aws.Realtime("Realtime", {
      authorizer: "services/authorizer/index.handler",
    })

    const exportsBucket = new sst.aws.Bucket("ExportsBucket", {
      access: "public",
    })

    const submissionsRouter = new sst.aws.Router("SubmissionsRouter", {
      routes: {
        "/*": {
          bucket: submissionBucket,
        },
      },
    })

    const thumbnailsRouter = new sst.aws.Router("ThumbnailsRouter", {
      routes: {
        "/*": {
          bucket: thumbnailBucket,
        },
      },
    })

    const previewsRouter = new sst.aws.Router("PreviewsRouter", {
      routes: {
        "/*": {
          bucket: previewBucket,
        },
      },
    })

    const marathonSettingsRouter = new sst.aws.Router(
      "MarathonSettingsRouter",
      {
        routes: {
          "/*": {
            bucket: marathonSettingsBucket,
          },
        },
      }
    )

    const api = new sst.aws.Function("Api", {
      handler: "./apps/api/src/index.handler",
      url: true,
      timeout: "60 seconds",
      memory: "2 GB",
      environment: {
        POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
        SUBMISSION_DISTRIBUTION_ID: submissionsRouter.distributionID,
        PREVIEW_DISTRIBUTION_ID: previewsRouter.distributionID,
        THUMBNAIL_DISTRIBUTION_ID: thumbnailsRouter.distributionID,
        ...env,
      },
      link: [
        realtime,
        submissionBucket,
        exportsBucket,
        marathonSettingsBucket,
        thumbnailBucket,
        previewBucket,
        contactSheetsBucket,
      ],
      permissions: [
        {
          effect: "allow",
          actions: ["cloudfront:CreateInvalidation"],
          resources: ["*"],
        },
      ],
    })

    const variantGenerator = new sst.aws.Function("VariantsGenerator", {
      handler: "./services/variants-generator/index.handler",
      environment: env,
      url: true,
      link: [
        submissionBucket,
        thumbnailBucket,
        previewBucket,
        exportsBucket,
        api,
      ],
      nodejs: {
        install: ["sharp"],
      },
      permissions: [
        {
          actions: ["s3:GetObject", "s3:PutObject"],
          resources: [previewBucket.arn, exportsBucket.arn],
        },
      ],
    })

    const vpc = new sst.aws.Vpc("VimmerVPC")
    const cluster = new sst.aws.Cluster("VimmerCluster", { vpc })

    // const apiService = new sst.aws.Service("ApiService", {
    //   cluster,
    //   scaling: {
    //     min: 2,
    //     max: 10,
    //     cpuUtilization: 50,
    //     memoryUtilization: 50,
    //     requestCount: 200,
    //   },
    //   memory: "4 GB",
    //   cpu: "2 vCPU",
    //   image: {
    //     dockerfile: "./apps/api/Dockerfile",
    //   },
    //   environment: {
    //     POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
    //     POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    //     SUBMISSION_DISTRIBUTION_ID: submissionsRouter.distributionID,
    //     PREVIEW_DISTRIBUTION_ID: previewsRouter.distributionID,
    //     THUMBNAIL_DISTRIBUTION_ID: thumbnailsRouter.distributionID,
    //     IS_CONTAINER: "true",
    //     ...env,
    //   },
    //   link: [
    //     realtime,
    //     submissionBucket,
    //     exportsBucket,
    //     marathonSettingsBucket,
    //     thumbnailBucket,
    //     previewBucket,
    //     contactSheetsBucket,
    //   ],

    //   permissions: [
    //     {
    //       effect: "allow",
    //       actions: ["cloudfront:CreateInvalidation"],
    //       resources: ["*"],
    //     },
    //   ],
    //   health: {
    //     command: [
    //       "CMD-SHELL",
    //       "curl -f http://127.0.0.1:3222/health || exit 1",
    //     ],
    //     interval: "10 seconds",
    //     timeout: "5 seconds",
    //     retries: 3,
    //     startPeriod: "10 seconds",
    //   },
    //   dev: {
    //     url: "http://localhost:3222/",
    //     command: "bun run apps/api/src/index.ts",
    //   },
    //   loadBalancer: {
    //     domain: "api.blikka.app",
    //     health: {
    //       "3222/http": {
    //         path: "/health",
    //         interval: "10 seconds",
    //         healthyThreshold: 2,
    //         unhealthyThreshold: 2,
    //       },
    //     },
    //     rules: [
    //       { listen: "80/http", redirect: "443/https" },
    //       { listen: "443/https", forward: "3222/http" },
    //     ],
    //   },
    //   // Port your app listens on
    // });

    // const exportSubmissionsTask = new sst.aws.Task("ExportSubmissionsTask", {
    //   cluster,
    //   architecture: "arm64",
    //   image: {
    //     dockerfile: "./services/export-submission-zip/Dockerfile",
    //   },
    //   environment: env,
    //   link: [
    //     submissionBucket,
    //     thumbnailBucket,
    //     previewBucket,
    //     exportsBucket,
    //     api,
    //   ],
    //   permissions: [
    //     {
    //       actions: ["s3:GetObject", "s3:PutObject"],
    //       resources: [previewBucket.arn, exportsBucket.arn],
    //     },
    //   ],
    //   dev: {
    //     command: "bun start",
    //   },
    // });

    // const contactSheetGeneratorTask = new sst.aws.Task(
    //   "ContactSheetGenerator",
    //   {
    //     cluster,
    //     // architecture: "arm64",
    //     image: {
    //       dockerfile: "./services/contact-sheet-generator/Dockerfile",
    //     },
    //     environment: env,
    //     link: [
    //       submissionBucket,
    //       thumbnailBucket,
    //       previewBucket,
    //       exportsBucket,
    //       contactSheetsBucket,
    //       api,
    //     ],
    //     permissions: [
    //       {
    //         actions: ["s3:GetObject", "s3:PutObject"],
    //         resources: [previewBucket.arn, exportsBucket.arn],
    //       },
    //     ],
    //     dev: {
    //       command: "bun run services/contact-sheet-generator/index.ts",
    //     },
    //   },
    // );

    const generateParticipantZipTask = new sst.aws.Task(
      "GenerateParticipantZipTask",
      {
        cluster,
        image: {
          dockerfile: "/services/generate-participant-zip/Dockerfile",
        },
        environment: env,
        link: [
          submissionBucket,
          thumbnailBucket,
          previewBucket,
          exportsBucket,
          api,
        ],
        memory: "2 GB",
        permissions: [
          {
            actions: ["s3:GetObject", "s3:PutObject"],
            resources: [previewBucket.arn, exportsBucket.arn],
          },
        ],
        dev: {
          command: "bun run services/generate-participant-zip/index.ts",
        },
      }
    )

    // new sst.aws.Function("ExportCaller", {
    //   handler: "services/export-caller/index.handler",
    //   environment: env,
    //   link: [
    //     exportSubmissionsTask,
    //     generateParticipantZipTask,
    //     // contactSheetGeneratorTask,
    //   ],
    //   url: true,
    // });

    // new sst.aws.Function("DownloadPresignedFunction", {
    //   handler: "services/download-presigned/index.handler",
    //   environment: env,
    //   url: true,
    //   link: [exportsBucket],
    // })

    const processSubmissionDlq = new sst.aws.Queue("ProcessSubmissionDlq")
    const validateSubmissionDlq = new sst.aws.Queue("ValidateSubmissionDlq")

    const processSubmissionQueue = new sst.aws.Queue("ProcessPhotoQueue", {
      visibilityTimeout: "5 minutes",
      dlq: {
        retry: 5,
        queue: processSubmissionDlq.arn,
      },
    })

    const validateSubmissionQueue = new sst.aws.Queue(
      "ValidateSubmissionQueue",
      {
        dlq: validateSubmissionDlq.arn,
      }
    )

    const contactSheetGeneratorQueue = new sst.aws.Queue(
      "ContactSheetGeneratorQueue"
    )

    contactSheetGeneratorQueue.subscribe({
      handler: "./services/contact-sheet-generator/index.handler",
      memory: "4 GB",
      link: [
        contactSheetsBucket,
        marathonSettingsBucket,
        previewBucket,
        exportsBucket,
        api,
      ],
      environment: { ...env, FONTCONFIG_PATH: "/opt/etc/fonts" },
      url: true,
      nodejs: {
        install: ["sharp"],
      },
      layers: [
        "arn:aws:lambda:eu-north-1:347599033421:layer:amazon_linux_fonts:1",
      ],
      permissions: [
        {
          actions: ["s3:GetObject", "s3:PutObject"],
          resources: [
            previewBucket.arn,
            exportsBucket.arn,
            contactSheetsBucket.arn,
          ],
        },
      ],
    })

    validateSubmissionQueue.subscribe({
      handler: "./services/photo-validator/index.handler",
      environment: {
        ...env,
        POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      },
      link: [api],
    })

    processSubmissionQueue.subscribe({
      handler: "./services/photo-processor/index.handler",
      environment: {
        ...env,
        POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
        POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      },
      nodejs: {
        install: ["sharp"],
      },
      link: [
        realtime,
        submissionBucket,
        thumbnailBucket,
        previewBucket,
        validateSubmissionQueue,
        generateParticipantZipTask,
        contactSheetGeneratorQueue,
        api,
      ],
      timeout: "5 minutes",
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
    })

    submissionBucket.notify({
      notifications: [
        {
          name: "SubmissionBucketNotification",
          queue: processSubmissionQueue,
          events: ["s3:ObjectCreated:*"],
        },
      ],
    })

    new sst.aws.Nextjs("WebApp", {
      path: "./apps/web",
      dev: {
        command: "bun run dev --port 3000",
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
        api,
        // apiService,
        realtime,
        // exportSubmissionsTask,
        generateParticipantZipTask,
        variantGenerator,
        contactSheetGeneratorQueue,
        contactSheetsBucket,
      ],
      server: {
        install: ["sharp"],
      },
      environment: {
        ...env,
        NEXT_PUBLIC_API_URL: api.url,
        BETTER_AUTH_URL:
          process.env.NODE_ENV === "production"
            ? process.env.BETTER_AUTH_URL!
            : "http://localhost:3000",
      },
    })
  },
})
