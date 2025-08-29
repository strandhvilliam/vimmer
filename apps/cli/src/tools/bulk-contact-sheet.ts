import type { Command } from "commander";
import type { Tool } from "../types.js";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { db } from "@vimmer/api/db";
import { getParticipantsByDomainQuery } from "@vimmer/api/db/queries/participants.queries";

/**
 * Bulk Contact Sheet Generation Tool
 *
 * This tool fetches all participants for a specific domain and triggers
 * the SQS queue for contact-sheet generation. Each participant will be
 * sent as a separate message to the queue containing:
 * - domain: The domain identifier
 * - participantRef: The participant's reference ID
 *
 * Usage:
 *   vimmer bulk-contact-sheet --domain <domain-name>
 *   vimmer bulk-contact-sheet --domain <domain-name> --queue-url <custom-url>
 *
 * Environment Variables:
 *   CONTACT_SHEET_GENERATOR_QUEUE_URL - Default SQS queue URL if not provided via --queue-url
 */

const bulkContactSheetTool: Tool = {
  name: "bulk-contact-sheet",
  description:
    "Trigger SQS queue for contact-sheet generation for all participants in a domain",
  register: (program: Command) => {
    program
      .command("bulk-contact-sheet")
      .description(
        "Trigger contact-sheet generation queue for all participants in a domain",
      )
      .requiredOption(
        "-d, --domain <domain>",
        "Domain to generate contact sheets for",
      )
      .option("--queue-url <url>", "Override SQS queue URL")
      .action(async (options) => {
        try {
          await generateBulkContactSheets(options);
        } catch (error) {
          console.error("Error:", error);
          process.exit(1);
        }
      });
  },
};

interface BulkContactSheetOptions {
  domain: string;
  queueUrl?: string;
}

async function generateBulkContactSheets({
  domain,
  queueUrl,
}: BulkContactSheetOptions) {
  console.log(`🔍 Fetching participants for domain: ${domain}`);

  // Fetch all participants for the domain
  const participants = await getParticipantsByDomainQuery(db, { domain });

  if (participants.length === 0) {
    console.log("❌ No participants found for domain:", domain);
    return;
  }

  console.log(`📋 Found ${participants.length} participants`);

  // Initialize SQS client
  const sqs = new SQSClient({ region: "eu-north-1" });

  // Use provided queue URL or fall back to environment-based Resource
  const finalQueueUrl =
    queueUrl ||
    "https://sqs.eu-north-1.amazonaws.com/975050331958/vimmer-development-ContactSheetGeneratorQueueQueue-rafhhans";

  if (!finalQueueUrl) {
    throw new Error(
      "Queue URL not provided and CONTACT_SHEET_GENERATOR_QUEUE_URL environment variable not set",
    );
  }

  console.log(`📤 Sending messages to queue: ${finalQueueUrl}`);

  let successCount = 0;
  let failureCount = 0;

  // Send a message for each participant
  for (const participant of participants) {
    try {
      const messageBody = JSON.stringify({
        domain,
        participantRef: participant.reference,
      });

      console.log("Sending message to queue", messageBody);
      console.log("Queue URL", finalQueueUrl);

      await sqs.send(
        new SendMessageCommand({
          QueueUrl: finalQueueUrl,
          MessageBody: messageBody,
        }),
      );

      successCount++;
      console.log(
        `✅ Queued contact sheet generation for participant: ${participant.reference}`,
      );
    } catch (error) {
      failureCount++;
      console.error(
        `❌ Failed to queue contact sheet generation for participant ${participant.reference}:`,
        error,
      );
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`  ✅ Successfully queued: ${successCount}`);
  console.log(`  ❌ Failed to queue: ${failureCount}`);
  console.log(`  📋 Total participants: ${participants.length}`);

  if (failureCount > 0) {
    console.log(
      `\n⚠️  ${failureCount} participants failed to queue. Check the errors above.`,
    );
    process.exit(1);
  } else {
    console.log(
      `\n🎉 Successfully queued contact sheet generation for all ${successCount} participants!`,
    );
  }
}

export { bulkContactSheetTool };
