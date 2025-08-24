import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { eq, and } from "drizzle-orm"
import {
  participants,
  submissions,
  topics,
  marathons,
} from "@vimmer/api/db/schema"
import type { Tool } from "../types.js"
import type { Command } from "commander"
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

interface SubmissionDownloadOptions {
  domain: string
  orderIndex: number
  outputDir?: string
  skipExisting?: boolean
}

interface SubmissionWithDetails {
  id: number
  key: string
  participantReference: string
  participantFirstname: string
  participantLastname: string
  topicName: string
  topicOrderIndex: number
  marathonDomain: string
  size: number | null
  mimeType: string | null
}

const connectionString = process.env.DATABASE_URL || ""
const sql = postgres(connectionString)
const db = drizzle(sql)

// S3 client for downloading submissions
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
})

// We need to determine the bucket name - it should be available via environment or SST Resource
const getSubmissionBucketName = (): string => {
  // In production this would be Resource.SubmissionBucket.name
  // For now, we'll need to check environment variables or hardcode
  return (
    process.env.SUBMISSION_BUCKET_NAME ||
    "vimmer-production-submissionbucketbucket-rrnomubf"
  )
}

async function getSubmissionsByDomainAndTopic(
  domain: string,
  orderIndex: number
): Promise<SubmissionWithDetails[]> {
  try {
    console.log(
      `🔍 Querying submissions for domain ${domain} with topic orderIndex ${orderIndex}`
    )

    const result = await db
      .select({
        id: submissions.id,
        key: submissions.key,
        participantReference: participants.reference,
        participantFirstname: participants.firstname,
        participantLastname: participants.lastname,
        topicName: topics.name,
        topicOrderIndex: topics.orderIndex,
        marathonDomain: marathons.domain,
        size: submissions.size,
        mimeType: submissions.mimeType,
      })
      .from(submissions)
      .innerJoin(participants, eq(submissions.participantId, participants.id))
      .innerJoin(topics, eq(submissions.topicId, topics.id))
      .innerJoin(marathons, eq(submissions.marathonId, marathons.id))
      .where(
        and(eq(marathons.domain, domain), eq(topics.orderIndex, orderIndex))
      )

    console.log(
      `✅ Found ${result.length} submissions for topic with orderIndex ${orderIndex}`
    )

    return result.map((r) => ({
      id: r.id,
      key: r.key,
      participantReference: r.participantReference,
      participantFirstname: r.participantFirstname || "",
      participantLastname: r.participantLastname || "",
      topicName: r.topicName,
      topicOrderIndex: r.topicOrderIndex,
      marathonDomain: r.marathonDomain,
      size: r.size,
      mimeType: r.mimeType,
    }))
  } catch (error) {
    console.error(
      `❌ Failed to query submissions for domain ${domain} and orderIndex ${orderIndex}:`,
      error
    )
    throw error
  }
}

async function downloadSubmissionFile(
  submissionKey: string
): Promise<Buffer | null> {
  try {
    console.log(`📥 Downloading submission: ${submissionKey}`)

    const bucketName = getSubmissionBucketName()
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: submissionKey,
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      console.log(`⚠️  No body found for submission: ${submissionKey}`)
      return null
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray())
    console.log(
      `✅ Downloaded submission: ${submissionKey} (${buffer.length} bytes)`
    )

    return buffer
  } catch (error) {
    console.error(`❌ Failed to download submission ${submissionKey}:`, error)
    return null
  }
}

function getSubmissionFilename(
  submission: SubmissionWithDetails,
  originalKey: string
): string {
  // Extract file extension from the key or mimeType
  const keyExtension = originalKey.split(".").pop()?.toLowerCase()
  const mimeExtension = submission.mimeType?.split("/").pop()?.toLowerCase()
  const extension = keyExtension || mimeExtension || "jpg"

  // Format: {reference}_{topicName}.{extension}
  const topicName = submission.topicName.replace(/[^a-zA-Z0-9-_]/g, "_")
  return `${submission.participantReference}_${topicName}.${extension}`
}

async function downloadSubmissions(
  options: SubmissionDownloadOptions
): Promise<void> {
  try {
    // Get submissions for the specified domain and topic order index
    const submissions = await getSubmissionsByDomainAndTopic(
      options.domain,
      options.orderIndex
    )

    if (submissions.length === 0) {
      console.log(
        "ℹ️  No submissions found for the specified domain and topic."
      )
      return
    }

    // Get topic name from first submission for folder naming
    // const topicName = submissions[0]?.topicName || `topic_${options.orderIndex}`
    // const safeFolderName = topicName.replace(/[^a-zA-Z0-9-_]/g, "_")

    // Create base output directory
    const baseOutputDir =
      options.outputDir ||
      `./submissions-${options.domain}-${submissions[0]!.topicOrderIndex.toString().padStart(2, "0")}`
    await mkdir(baseOutputDir, { recursive: true })
    console.log(`📁 Created output directory: ${baseOutputDir}`)

    console.log(
      `🎯 Topic: ${submissions[0]!.topicName} (orderIndex: ${options.orderIndex})`
    )
    console.log(`👥 Found ${submissions.length} submissions`)

    let totalDownloaded = 0
    let totalSkipped = 0
    let totalFailed = 0

    // Download each submission
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i]!
      const progress = `${i + 1}/${submissions.length}`

      console.log(
        `\n📥 [${progress}] Processing ${submission.participantReference} (${submission.participantFirstname} ${submission.participantLastname})`
      )

      try {
        const filename = getSubmissionFilename(submission, submission.key)
        const filePath = join(baseOutputDir, filename)

        // Skip if file already exists and skipExisting is true
        if (options.skipExisting && existsSync(filePath)) {
          console.log(
            `⏭️  [${progress}] Skipping - file already exists: ${filename}`
          )
          totalSkipped++
          continue
        }

        // Download submission from S3
        const buffer = await downloadSubmissionFile(submission.key)

        if (!buffer) {
          console.log(`❌ [${progress}] Failed to download submission`)
          totalFailed++
          continue
        }

        // Save to local file
        await writeFile(filePath, buffer)
        console.log(
          `✅ [${progress}] Downloaded: ${filename} (${buffer.length} bytes)`
        )
        totalDownloaded++
      } catch (error) {
        console.error(`❌ [${progress}] Error downloading submission:`, error)
        totalFailed++
      }
    }

    // Summary
    console.log(`\n📊 Download Summary:`)
    console.log(`   ✅ Downloaded: ${totalDownloaded}`)
    console.log(`   ⏭️  Skipped: ${totalSkipped}`)
    console.log(`   ❌ Failed: ${totalFailed}`)
    console.log(`   📁 Output directory: ${baseOutputDir}`)

    if (totalDownloaded > 0) {
      console.log(
        `\n🎉 Successfully downloaded ${totalDownloaded} submissions for topic "${submissions[0]!.topicName}"!`
      )
    }
  } catch (error) {
    console.error("❌ Failed to download submissions:", error)
    throw error
  }
}

export const submissionDownloadTool: Tool = {
  name: "download-submissions",
  description:
    "Download submission photos for a specific topic by domain and orderIndex",
  register: (program: Command) => {
    program
      .command("download-submissions")
      .description(
        "Download submission photos for a specific topic by domain and orderIndex"
      )
      .argument("<domain>", "Marathon domain")
      .argument("<order-index>", "Topic order index (0-based)", parseInt)
      .option(
        "-o, --output-dir <dir>",
        "Output directory (default: ./submissions-{domain}-{topic})"
      )
      .option(
        "-s, --skip-existing",
        "Skip downloading if file already exists",
        false
      )
      .action(async (domain: string, orderIndex: number, options: any) => {
        if (isNaN(orderIndex)) {
          console.error("❌ Order index must be a valid number")
          return
        }

        const downloadOptions: SubmissionDownloadOptions = {
          domain,
          orderIndex,
          outputDir: options.outputDir,
          skipExisting: options.skipExisting || false,
        }

        await downloadSubmissions(downloadOptions)
      })
  },
}
