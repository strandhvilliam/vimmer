import { processUploads } from "./process-uploads";

async function main() {
  // Get domain and optional reference from command line arguments
  const domain = process.argv[2];
  const reference = process.argv[3];

  if (!domain || domain.trim() === "") {
    console.error("❌ Domain is required");
    console.log("Usage: bun run src/index.ts <domain> [reference]");
    console.log("Example: bun run src/index.ts malmofoto.se");
    console.log("Example: bun run src/index.ts malmofoto.se participant-123");
    process.exit(1);
  }

  const referenceInfo = reference ? ` and reference: ${reference}` : "";
  console.log(`🏁 Starting script with domain: ${domain}${referenceInfo}`);

  try {
    const report = await processUploads(domain, reference);

    // Log detailed report
    console.log("\n" + "=".repeat(60));
    console.log("📊 PROCESSING REPORT");
    console.log("=".repeat(60));
    console.log(`Domain: ${report.domain}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Participants Found: ${report.totalParticipantsFound}`);
    console.log(`Participants Processed: ${report.totalParticipantsProcessed}`);
    console.log(`Participants Completed: ${report.participantsCompleted}`);
    console.log(`Submissions Updated: ${report.submissionsUpdated}`);
    console.log(`Duplicates Deleted: ${report.duplicatesDeleted}`);
    console.log(`Errors: ${report.errors.length}`);

    if (report.participants.length > 0) {
      console.log("\n📋 PARTICIPANT DETAILS:");
      for (const p of report.participants) {
        console.log(
          `  ${p.reference} (${p.id}): ${p.status} - ${p.submissionsUploaded}/${p.requiredSubmissions} uploaded`,
        );
      }
    }

    if (report.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      for (const error of report.errors) {
        console.log(`  ${error.reference}: ${error.error}`);
      }
    }

    console.log("=".repeat(60));

    // Exit with non-zero code if there were errors
    if (report.errors.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
