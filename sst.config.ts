/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'vimmer',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
    }
  },
  async run() {
    const env = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    }

    const submissionBucket = new sst.aws.Bucket('SubmissionBucket', {
      access: 'public',
    })
    const processSubmissionQueue = new sst.aws.Queue('ProcessPhotoQueue')

    processSubmissionQueue.subscribe({
      handler: './functions/photo-processor/index.handler',
      environment: env,
      link: [submissionBucket],
    })

    submissionBucket.notify({
      notifications: [
        {
          name: 'SubmissionBucketNotification',
          queue: processSubmissionQueue,
          events: ['s3:ObjectCreated:*'],
        },
      ],
    })

    return {
      buckets: {
        submissionBucket: submissionBucket.name,
      },
      queues: {
        processSubmissionQueue: processSubmissionQueue.url,
      },
    }
  },
})
