import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { eq, and, isNotNull } from "drizzle-orm"
import { participants, competitionClasses } from "@vimmer/api/db/schema"
import {
  downloadContactSheet,
  getContactSheetFilename,
} from "../services/s3-client.js"
import { getMarathonData } from "../services/participant-queries.js"
import type { Tool } from "../types.js"
import type { Command } from "commander"
import { mkdir, writeFile } from "fs/promises"
import { join, dirname } from "path"
import { existsSync } from "fs"

interface ContactSheetDownloadOptions {
  marathonId: string
  outputDir?: string
  skipExisting?: boolean
}

interface ParticipantWithClass {
  id: number
  reference: string
  firstname: string
  lastname: string
  contactSheetKey: string
  competitionClassName: string | null
  competitionClassId: number | null
}

const connectionString = process.env.DATABASE_URL || ""
const sql = postgres(connectionString)
const db = drizzle(sql)

async function getParticipantsWithCompetitionClasses(
  marathonId: number
): Promise<ParticipantWithClass[]> {
  try {
    console.log(
      `🔍 Querying participants with competition classes for marathon ${marathonId}`
    )

    const result = await db
      .select({
        id: participants.id,
        reference: participants.reference,
        firstname: participants.firstname,
        lastname: participants.lastname,
        contactSheetKey: participants.contactSheetKey,
        competitionClassName: competitionClasses.name,
        competitionClassId: participants.competitionClassId,
      })
      .from(participants)
      .leftJoin(
        competitionClasses,
        eq(participants.competitionClassId, competitionClasses.id)
      )
      .where(
        and(
          eq(participants.marathonId, marathonId),
          eq(participants.status, "verified"),
          isNotNull(participants.contactSheetKey)
        )
      )

    console.log(
      `✅ Found ${result.length} verified participants with contact sheets`
    )

    return result.map((p) => ({
      id: p.id,
      reference: p.reference,
      firstname: p.firstname || "",
      lastname: p.lastname || "",
      contactSheetKey: p.contactSheetKey!,
      competitionClassName: p.competitionClassName,
      competitionClassId: p.competitionClassId,
    }))
  } catch (error) {
    console.error(
      `❌ Failed to query participants for marathon ${marathonId}:`,
      error
    )
    throw error
  }
}

async function downloadContactSheets(
  options: ContactSheetDownloadOptions
): Promise<void> {
  const marathonId = parseInt(options.marathonId, 10)

  if (isNaN(marathonId)) {
    throw new Error("Invalid marathon ID provided")
  }

  try {
    // Get marathon data for folder naming
    const marathon = await getMarathonData(marathonId)
    console.log(`📋 Marathon: ${marathon.name} (${marathon.domain})`)

    // Get participants with their competition classes
    const participants = await getParticipantsWithCompetitionClasses(marathonId)

    if (participants.length === 0) {
      console.log("ℹ️  No participants with contact sheets found.")
      return
    }

    // Create base output directory
    const baseOutputDir =
      options.outputDir || `./contact-sheets-${marathon.domain}-${marathonId}`
    await mkdir(baseOutputDir, { recursive: true })
    console.log(`📁 Created output directory: ${baseOutputDir}`)

    // Group participants by competition class
    const participantsByClass = new Map<string, ParticipantWithClass[]>()

    for (const participant of participants) {
      const className = participant.competitionClassName || "unassigned"
      if (!participantsByClass.has(className)) {
        participantsByClass.set(className, [])
      }
      participantsByClass.get(className)!.push(participant)
    }

    console.log(`🏆 Found ${participantsByClass.size} competition classes:`)
    for (const [className, classParticipants] of participantsByClass) {
      console.log(`   - ${className}: ${classParticipants.length} participants`)
    }

    let totalDownloaded = 0
    let totalSkipped = 0
    let totalFailed = 0

    // Download contact sheets for each competition class
    for (const [className, classParticipants] of participantsByClass) {
      console.log(`\n🏆 Processing competition class: ${className}`)

      // Create class directory
      const classDir = join(
        baseOutputDir,
        className.replace(/[^a-zA-Z0-9-_]/g, "_")
      )
      await mkdir(classDir, { recursive: true })

      // Download each participant's contact sheet
      for (let i = 0; i < classParticipants.length; i++) {
        const participant = classParticipants[i]!
        const progress = `${i + 1}/${classParticipants.length}`

        console.log(
          `\n📥 [${className}] [${progress}] Processing ${participant.reference} (${participant.firstname} ${participant.lastname})`
        )

        try {
          const filename = getContactSheetFilename(
            participant.contactSheetKey,
            participant.reference
          )
          const filePath = join(classDir, filename)

          // Skip if file already exists and skipExisting is true
          if (options.skipExisting && existsSync(filePath)) {
            console.log(
              `⏭️  [${className}] [${progress}] Skipping - file already exists: ${filename}`
            )
            totalSkipped++
            continue
          }

          // Download contact sheet from S3
          const buffer = await downloadContactSheet(participant.contactSheetKey)

          if (!buffer) {
            console.log(
              `❌ [${className}] [${progress}] Failed to download contact sheet`
            )
            totalFailed++
            continue
          }

          // Save to local file
          await writeFile(filePath, buffer)
          console.log(
            `✅ [${className}] [${progress}] Downloaded: ${filename} (${buffer.length} bytes)`
          )
          totalDownloaded++
        } catch (error) {
          console.error(
            `❌ [${className}] [${progress}] Error downloading contact sheet:`,
            error
          )
          totalFailed++
        }
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
        `\n🎉 Successfully downloaded ${totalDownloaded} contact sheets organized by competition class!`
      )
    }
  } catch (error) {
    console.error("❌ Failed to download contact sheets:", error)
    throw error
  }
}

export const contactSheetDownloadTool: Tool = {
  name: "download-contact-sheets",
  description:
    "Download all contact sheets for a marathon organized by competition class",
  register: (program: Command) => {
    program
      .command("download-contact-sheets")
      .description(
        "Download all contact sheets for a marathon organized by competition class"
      )
      .argument("<marathon-id>", "Marathon ID")
      .option(
        "-o, --output-dir <dir>",
        "Output directory (default: ./contact-sheets-{domain}-{marathonId})"
      )
      .option(
        "-s, --skip-existing",
        "Skip downloading if file already exists",
        false
      )
      .action(async (marathonId: string, options: any) => {
        const downloadOptions: ContactSheetDownloadOptions = {
          marathonId,
          outputDir: options.outputDir,
          skipExisting: options.skipExisting || false,
        }

        await downloadContactSheets(downloadOptions)
      })
  },
}
