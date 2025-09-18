/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "blikka",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    }
  },
  async run() {
    /* BUCKETS */

    const submissionsBucket = new sst.aws.Bucket("V2SubmissionsBucket", {
      access: "public",
    })
    const thumbnailsBucket = new sst.aws.Bucket("V2ThumbnailsBucket", {
      access: "public",
    })
    const contactSheetsBucket = new sst.aws.Bucket("V2ContactSheetsBucket", {
      access: "public",
    })
    const sponsorBucket = new sst.aws.Bucket("V2SponsorBucket", {
      access: "public",
    })
    const zipsBucket = new sst.aws.Bucket("V2ZipsBucket", {
      access: "public",
    })

    /* QUEUES & BUSES */

    const submissionFinalizedBus = new sst.aws.Bus("SubmissionFinalizedBus")
    const uploadProcessorQueue = new sst.aws.Queue("UploadStatusQueue")
    const validationQueue = new sst.aws.Queue("ValidationQueue")
    const sheetGeneratorQueue = new sst.aws.Queue("SheetGeneratorQueue")
    const zipGeneratorQueue = new sst.aws.Queue("ZipGeneratorQueue")

    /* BUCKET NOTIFICATIONS */

    submissionsBucket.notify({
      notifications: [
        {
          name: "SubmissionsBucketNotification",
          queue: uploadProcessorQueue,
          events: ["s3:ObjectCreated:*"],
        },
      ],
    })

    /* TASKS */
    const vpc = new sst.aws.Vpc("BlikkaMainVPC")
    const cluster = new sst.aws.Cluster("BlikkaMainCluster", { vpc })
    const zipHandlerTask = new sst.aws.Task("ZipHandlerTask", {
      cluster,
      image: {
        dockerfile: "/tasks/zip-handler/Dockerfile",
      },
      link: [submissionsBucket],
    })

    /* QUEUE HANDLERS */

    uploadProcessorQueue.subscribe({
      handler: "./tasks/upload-processor/index.handler",
      link: [uploadProcessorQueue, submissionsBucket],
    })

    sheetGeneratorQueue.subscribe({
      handler: "./tasks/contact-sheet-generator/index.handler",
      link: [sheetGeneratorQueue, contactSheetsBucket, submissionsBucket],
    })

    zipGeneratorQueue.subscribe({
      handler: "./tasks/zip-generator/handler.handler",
      link: [
        zipGeneratorQueue,
        submissionsBucket,
        thumbnailsBucket,
        contactSheetsBucket,
        sponsorBucket,
        zipHandlerTask,
      ],
    })

    /* BUS SUBSCRIPTIONS */

    submissionFinalizedBus.subscribeQueue(
      "ValidationBusSubscription",
      validationQueue
    )
    submissionFinalizedBus.subscribeQueue(
      "SheetGeneratorBusSubscription",
      sheetGeneratorQueue
    )
    submissionFinalizedBus.subscribeQueue(
      "ZipGeneratorBusSubscription",
      zipGeneratorQueue
    )

    /* DEV CALLER */

    const devCallerFn = new sst.aws.Function("DevCaller", {
      url: true,
      handler: "./tasks/dev-caller/index.handler",
      link: [submissionFinalizedBus],
    })

    return {
      devCaller: devCallerFn.url,
    }
  },
})

// function v1() {
//   const env = {
//     NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
//     NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
//     REVALIDATE_SECRET: process.env.REVALIDATE_SECRET!,
//     DATABASE_URL: process.env.DATABASE_URL!,
//     JURY_JWT_SECRET: process.env.JURY_JWT_SECRET!,
//     TEMP_ENV: "true",
//   }

//   const allowOrigins =
//     process.env.SUBMISSION_BUCKETS_ALLOW_ORIGINS?.split(",") ?? []

//   const submissionBucket = new sst.aws.Bucket("SubmissionBucket", {
//     access: "cloudfront",
//     cors: {
//       allowOrigins,
//       allowMethods: ["GET", "HEAD", "PUT"],
//       allowHeaders: ["*"],
//       exposeHeaders: ["Access-Control-Allow-Origin"],
//     },
//   })
//   const thumbnailBucket = new sst.aws.Bucket("ThumbnailBucket", {
//     access: "cloudfront",
//     cors: {
//       allowOrigins,
//       allowMethods: ["PUT"],
//       allowHeaders: ["*"],
//     },
//   })
//   const previewBucket = new sst.aws.Bucket("PreviewBucket", {
//     access: "cloudfront",
//     cors: {
//       allowOrigins,
//       allowMethods: ["PUT"],
//       allowHeaders: ["*"],
//     },
//   })
//   const marathonSettingsBucket = new sst.aws.Bucket("MarathonSettingsBucket", {
//     access: "cloudfront",
//     cors: {
//       allowOrigins,
//     },
//   })

//   const contactSheetsBucket = new sst.aws.Bucket("ContactSheetsBucket", {
//     access: "public",
//   })

//   const realtime = new sst.aws.Realtime("Realtime", {
//     authorizer: "services/authorizer/index.handler",
//   })

//   const exportsBucket = new sst.aws.Bucket("ExportsBucket", {
//     access: "public",
//   })

//   const submissionsRouter = new sst.aws.Router("SubmissionsRouter", {
//     routes: {
//       "/*": {
//         bucket: submissionBucket,
//       },
//     },
//   })

//   const thumbnailsRouter = new sst.aws.Router("ThumbnailsRouter", {
//     routes: {
//       "/*": {
//         bucket: thumbnailBucket,
//       },
//     },
//   })

//   const previewsRouter = new sst.aws.Router("PreviewsRouter", {
//     routes: {
//       "/*": {
//         bucket: previewBucket,
//       },
//     },
//   })

//   const marathonSettingsRouter = new sst.aws.Router("MarathonSettingsRouter", {
//     routes: {
//       "/*": {
//         bucket: marathonSettingsBucket,
//       },
//     },
//   })

//   const api = new sst.aws.Function("Api", {
//     handler: "./apps/api/src/index.handler",
//     url: true,
//     timeout: "60 seconds",
//     memory: "2 GB",
//     environment: {
//       POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
//       POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
//       SUBMISSION_DISTRIBUTION_ID: submissionsRouter.distributionID,
//       PREVIEW_DISTRIBUTION_ID: previewsRouter.distributionID,
//       THUMBNAIL_DISTRIBUTION_ID: thumbnailsRouter.distributionID,
//       ...env,
//     },
//     link: [
//       realtime,
//       submissionBucket,
//       exportsBucket,
//       marathonSettingsBucket,
//       thumbnailBucket,
//       previewBucket,
//       contactSheetsBucket,
//     ],
//     permissions: [
//       {
//         effect: "allow",
//         actions: ["cloudfront:CreateInvalidation"],
//         resources: ["*"],
//       },
//     ],
//   })

//   const variantGenerator = new sst.aws.Function("VariantsGenerator", {
//     handler: "./services/variants-generator/index.handler",
//     environment: env,
//     url: true,
//     link: [
//       submissionBucket,
//       thumbnailBucket,
//       previewBucket,
//       exportsBucket,
//       api,
//     ],
//     nodejs: {
//       install: ["sharp"],
//     },
//     permissions: [
//       {
//         actions: ["s3:GetObject", "s3:PutObject"],
//         resources: [previewBucket.arn, exportsBucket.arn],
//       },
//     ],
//   })

//   const vpc = new sst.aws.Vpc("VimmerVPC")
//   const cluster = new sst.aws.Cluster("VimmerCluster", { vpc })

//   const generateParticipantZipTask = new sst.aws.Task(
//     "GenerateParticipantZipTask",
//     {
//       cluster,
//       image: {
//         dockerfile: "/services/generate-participant-zip/Dockerfile",
//       },
//       environment: env,
//       link: [
//         submissionBucket,
//         thumbnailBucket,
//         previewBucket,
//         exportsBucket,
//         api,
//       ],
//       memory: "4 GB",
//       cpu: "2 vCPU",
//       permissions: [
//         {
//           actions: ["s3:GetObject", "s3:PutObject"],
//           resources: [previewBucket.arn, exportsBucket.arn],
//         },
//       ],
//       dev: {
//         command: "bun run services/generate-participant-zip/index.ts",
//       },
//     }
//   )

//   const processSubmissionDlq = new sst.aws.Queue("ProcessSubmissionDlq")
//   const validateSubmissionDlq = new sst.aws.Queue("ValidateSubmissionDlq")

//   const processSubmissionQueue = new sst.aws.Queue("ProcessPhotoQueue", {
//     visibilityTimeout: "5 minutes",
//     dlq: {
//       retry: 5,
//       queue: processSubmissionDlq.arn,
//     },
//   })

//   const validateSubmissionQueue = new sst.aws.Queue("ValidateSubmissionQueue", {
//     dlq: validateSubmissionDlq.arn,
//   })

//   const contactSheetGeneratorQueue = new sst.aws.Queue(
//     "ContactSheetGeneratorQueue"
//   )

//   contactSheetGeneratorQueue.subscribe({
//     handler: "./services/contact-sheet-generator/index.handler",
//     memory: "4 GB",
//     link: [
//       contactSheetsBucket,
//       marathonSettingsBucket,
//       previewBucket,
//       exportsBucket,
//       api,
//     ],
//     environment: { ...env, FONTCONFIG_PATH: "/opt/etc/fonts" },
//     url: true,
//     nodejs: {
//       install: ["sharp"],
//     },
//     layers: [
//       "arn:aws:lambda:eu-north-1:347599033421:layer:amazon_linux_fonts:1",
//     ],
//     permissions: [
//       {
//         actions: ["s3:GetObject", "s3:PutObject"],
//         resources: [
//           previewBucket.arn,
//           exportsBucket.arn,
//           contactSheetsBucket.arn,
//         ],
//       },
//     ],
//   })

//   validateSubmissionQueue.subscribe({
//     handler: "./services/photo-validator/index.handler",
//     environment: {
//       ...env,
//       POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
//       POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
//     },
//     link: [api],
//   })

//   processSubmissionQueue.subscribe({
//     handler: "./services/photo-processor/index.handler",
//     environment: {
//       ...env,
//       POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
//       POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
//     },
//     nodejs: {
//       install: ["sharp"],
//     },
//     link: [
//       realtime,
//       submissionBucket,
//       thumbnailBucket,
//       previewBucket,
//       validateSubmissionQueue,
//       generateParticipantZipTask,
//       contactSheetGeneratorQueue,
//       api,
//     ],
//     timeout: "5 minutes",
//     permissions: [
//       {
//         actions: ["s3:GetObject", "s3:PutObject"],
//         resources: [
//           submissionBucket.arn,
//           thumbnailBucket.arn,
//           previewBucket.arn,
//         ],
//       },
//     ],
//   })

//   submissionBucket.notify({
//     notifications: [
//       {
//         name: "SubmissionBucketNotification",
//         queue: processSubmissionQueue,
//         events: ["s3:ObjectCreated:*"],
//       },
//     ],
//   })

//   new sst.aws.Nextjs("WebApp", {
//     path: "./apps/web",
//     dev: {
//       command: "bun run dev --port 3000",
//     },
//     link: [
//       submissionBucket,
//       thumbnailBucket,
//       previewBucket,
//       exportsBucket,
//       marathonSettingsBucket,
//       submissionsRouter,
//       thumbnailsRouter,
//       previewsRouter,
//       marathonSettingsRouter,
//       api,
//       // apiService,
//       realtime,
//       // exportSubmissionsTask,
//       generateParticipantZipTask,
//       variantGenerator,
//       contactSheetGeneratorQueue,
//       contactSheetsBucket,
//     ],
//     server: {
//       install: ["sharp"],
//     },
//     environment: {
//       ...env,
//       NEXT_PUBLIC_API_URL: api.url,
//       BETTER_AUTH_URL:
//         process.env.NODE_ENV === "production"
//           ? process.env.BETTER_AUTH_URL!
//           : "http://localhost:3000",
//     },
//   })
// }
