import { batchProcessContactSheets } from "./index"
import { db } from "@vimmer/api/db"
import { getParticipantsByDomainQuery } from "@vimmer/api/db/queries/participants.queries"

const VALID_PHOTO_COUNTS = [8, 24]

interface RunBatchOptions {
  domain: string
  // Optional filters
  requireSubmissions?: boolean
  requireValidPhotoCount?: boolean
  excludeExistingContactSheets?: boolean
  limitParticipants?: number
  onlyParticipantRefs?: string[]
  onlyVerifiedParticipants?: boolean
}

async function main() {
  const options: RunBatchOptions = {
    domain: "sthlm2025", // Replace with actual domain
    requireSubmissions: true, // Only process participants with submissions
    requireValidPhotoCount: true, // Only process 8 or 24 photo participants
    excludeExistingContactSheets: true, // Skip participants who already have contact sheets
    limitParticipants: 100, // Limit for testing - remove for full batch
    onlyVerifiedParticipants: true,
    onlyParticipantRefs: ["0226", "0884"], // Uncomment to process specific participants only
  }

  console.log(
    `🚀 Starting batch contact sheet generation for domain: ${options.domain}`
  )

  try {
    // Fetch all participants from database
    console.log("📋 Fetching participants from database...")
    const allParticipants = await getParticipantsByDomainQuery(db, {
      domain: options.domain,
    })

    console.log(`📊 Found ${allParticipants.length} total participants`)

    // Apply filters
    let filteredParticipants = allParticipants

    // Filter: Only specific participant refs (if specified)
    if (options.onlyParticipantRefs && options.onlyParticipantRefs.length > 0) {
      filteredParticipants = filteredParticipants.filter((p) =>
        options.onlyParticipantRefs!.includes(p.reference)
      )
      console.log(
        `🔍 Filtered to ${filteredParticipants.length} participants (specific refs only)`
      )
    }

    // Filter: Only verified participants
    if (options.onlyVerifiedParticipants) {
      filteredParticipants = filteredParticipants.filter(
        (p) => p.status === "verified"
      )
      console.log(
        `✅ Filtered to ${filteredParticipants.length} participants (verified)`
      )
    }

    // Filter: Require submissions
    if (options.requireSubmissions) {
      filteredParticipants = filteredParticipants.filter(
        (p) => p.submissions && p.submissions.length > 0
      )
      console.log(
        `📸 Filtered to ${filteredParticipants.length} participants (with submissions)`
      )
    }

    // Filter: Require valid photo count
    if (options.requireValidPhotoCount) {
      filteredParticipants = filteredParticipants.filter(
        (p) =>
          p.competitionClass?.numberOfPhotos &&
          VALID_PHOTO_COUNTS.includes(p.competitionClass.numberOfPhotos)
      )
      console.log(
        `✅ Filtered to ${filteredParticipants.length} participants (valid photo count)`
      )
    }

    // Filter: Exclude existing contact sheets
    if (options.excludeExistingContactSheets) {
      filteredParticipants = filteredParticipants.filter(
        (p) => !p.contactSheetKey || p.contactSheetKey.trim() === ""
      )
      console.log(
        `🆕 Filtered to ${filteredParticipants.length} participants (no existing contact sheets)`
      )
    }

    // Apply limit for testing
    if (
      options.limitParticipants &&
      filteredParticipants.length > options.limitParticipants
    ) {
      console.log(
        `⚠️  Limiting to ${options.limitParticipants} participants for testing`
      )
      filteredParticipants = filteredParticipants.slice(
        0,
        options.limitParticipants
      )
    }

    if (filteredParticipants.length === 0) {
      console.log("❌ No participants match the criteria. Exiting.")
      return
    }

    // Extract participant references
    const participantRefs = filteredParticipants.map((p) => p.reference)

    console.log(`\n🎯 Processing ${participantRefs.length} participants:`)
    participantRefs.forEach((ref, index) => {
      console.log(`   ${index + 1}. ${ref}`)
    })

    console.log("\n" + "=".repeat(50))
    console.log("Starting batch processing...")
    console.log("=".repeat(50))

    // Run the batch processing
    const result = await batchProcessContactSheets({
      domain: options.domain,
      participantRefs,
    })

    // Display results
    console.log("\n" + "=".repeat(50))
    console.log("🎉 BATCH PROCESSING COMPLETE")
    console.log("=".repeat(50))

    console.log("\n📈 Summary:")
    console.log(`   Total processed: ${result.summary.totalProcessed}`)
    console.log(`   ✅ Successful: ${result.summary.successful}`)
    console.log(`   ❌ Failed: ${result.summary.failed}`)
    console.log(
      `   💾 DB Updates successful: ${result.summary.dbUpdatesSuccessful}`
    )
    console.log(`   💾 DB Updates failed: ${result.summary.dbUpdatesFailed}`)

    if (result.summary.failed > 0) {
      console.log("\n❌ Processing Failures:")
      result.processingResults
        .filter((r) => r.status === "error")
        .forEach((r) => {
          console.log(`   • ${r.participantRef}: ${r.error}`)
        })
    }

    if (result.summary.dbUpdatesFailed > 0) {
      console.log("\n💾 Database Update Failures:")
      result.dbUpdateResults
        .filter((r) => r.status === "error")
        .forEach((r) => {
          console.log(`   • Participant ID ${r.participantId}: ${r.error}`)
        })
    }

    if (result.summary.successful > 0) {
      console.log("\n✅ Successfully processed participants:")
      result.processingResults
        .filter((r) => r.status === "success")
        .forEach((r) => {
          console.log(`   • ${r.participantRef} → ${r.contactSheetKey}`)
        })
    }

    console.log("\n🏁 Batch processing completed successfully!")
  } catch (error) {
    console.error("\n💥 Fatal error during batch processing:", error)
    console.error(
      "\nStack trace:",
      error instanceof Error ? error.stack : "No stack trace available"
    )
    process.exit(1)
  }
}

// Handle process signals gracefully
process.on("SIGINT", () => {
  console.log("\n⚠️  Received SIGINT. Gracefully shutting down...")
  process.exit(0)
})

process.on("SIGTERM", () => {
  console.log("\n⚠️  Received SIGTERM. Gracefully shutting down...")
  process.exit(0)
})

// Run the script
main().catch((error) => {
  console.error("💥 Unhandled error:", error)
  process.exit(1)
})
