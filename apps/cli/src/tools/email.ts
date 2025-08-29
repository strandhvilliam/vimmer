import type { Command } from "commander";
import type { Tool } from "../types.js";
import type { EmailOptions, EmailSummary } from "../types/email.js";
import {
  getVerifiedParticipantsWithContactSheets,
  getParticipantById,
  markContactSheetAsSent,
  getMarathonEmailStats,
  getTestParticipants,
  getMarathonData,
} from "../services/participant-queries.js";
import { sendContactSheetEmail } from "../services/email-sender.js";

async function sendContactSheets(
  marathonIdStr: string,
  options: EmailOptions,
): Promise<void> {
  const marathonId = parseInt(marathonIdStr);
  if (isNaN(marathonId)) {
    console.error("❌ Invalid marathon ID. Please provide a valid number.");
    return;
  }

  console.log(
    `📧 Starting contact sheet email campaign for marathon ${marathonId}`,
  );
  console.log(`⚙️  Options:`, {
    limit: options.limit || "no limit",
    test: options.test ? "YES - using test data" : "no",
    skipSent: options.skipSent !== false ? "YES - skipping already sent" : "no",
    from: options.from || "default sender",
  });

  try {
    // Get participants (real or test data)
    const participants = options.test
      ? getTestParticipants(options.limit || 5).map((p) => ({
          ...p,
          contactSheetSent: false,
          marathonId,
        }))
      : await getVerifiedParticipantsWithContactSheets(
          marathonId,
          options.skipSent !== false,
          options.limit,
        );

    if (participants.length === 0) {
      console.log("ℹ️  No participants found to send emails to.");
      return;
    }

    console.log(`👥 Found ${participants.length} participants to email`);

    const summary: EmailSummary = {
      total: participants.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    const marathonData = await getMarathonData(marathonId);

    // Send emails with progress tracking
    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      if (!participant) continue;

      const progress = `${i + 1}/${participants.length}`;

      console.log(
        `\n📤 [${progress}] Processing ${participant.reference} (${participant.email})`,
      );

      // Fail if no contact sheet key (unless in test mode)
      if (!options.test && !participant.contactSheetKey) {
        console.log(`❌ [${progress}] Failed - no contact sheet available`);
        summary.failed++;
        summary.errors.push(
          `${participant.reference}: No contact sheet available`,
        );
        continue;
      }

      try {
        const marathonName = options.test
          ? "Test Marathon 2025"
          : marathonData.name;

        const result = await sendContactSheetEmail(
          participant,
          marathonName,
          options.from,
        );

        if (result.success) {
          summary.sent++;

          // Mark as sent in database (skip for test mode)
          if (!options.test) {
            await markContactSheetAsSent(participant.id);
          }

          console.log(`✅ [${progress}] Email sent successfully`);
        } else {
          summary.failed++;
          summary.errors.push(
            `${participant.reference}: ${result.error || "Unknown error"}`,
          );
          console.log(`❌ [${progress}] Failed to send email: ${result.error}`);
        }
      } catch (error) {
        summary.failed++;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        summary.errors.push(`${participant.reference}: ${errorMessage}`);
        console.error(`❌ [${progress}] Unexpected error:`, errorMessage);
      }

      // Add small delay between emails to avoid rate limiting
      if (i < participants.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Print final summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 CAMPAIGN SUMMARY");
    console.log("=".repeat(50));
    console.log(`📊 Total participants: ${summary.total}`);
    console.log(`✅ Successfully sent: ${summary.sent}`);
    console.log(
      `❌ Failed: ${summary.failed} (missing contact sheets or email errors)`,
    );
    console.log(`⏭️  Skipped: ${summary.skipped}`);
    console.log(
      `📈 Success rate: ${summary.total > 0 ? Math.round((summary.sent / summary.total) * 100) : 0}%`,
    );

    if (summary.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      summary.errors.forEach((error) => console.log(`  • ${error}`));
    }

    if (options.test) {
      console.log(
        "\n🧪 This was a TEST RUN with hardcoded data. No database updates were made.",
      );
    }
  } catch (error) {
    console.error("❌ Campaign failed with error:", error);
  }
}

async function previewContactSheets(
  marathonIdStr: string,
  options: EmailOptions,
): Promise<void> {
  const marathonId = parseInt(marathonIdStr);
  if (isNaN(marathonId)) {
    console.error("❌ Invalid marathon ID. Please provide a valid number.");
    return;
  }

  console.log(`👀 Previewing contact sheet emails for marathon ${marathonId}`);

  try {
    // Get participants (real or test data)
    const participants = options.test
      ? getTestParticipants(options.limit || 5)
      : await getVerifiedParticipantsWithContactSheets(
          marathonId,
          options.skipSent !== false,
          options.limit,
        );

    console.log(
      `\n📋 PREVIEW - ${participants.length} participants would receive emails:`,
    );
    console.log("=".repeat(60));

    participants.forEach((participant, index) => {
      console.log(`${index + 1}. ${participant.reference}`);
      console.log(`   📧 Email: ${participant.email}`);
      console.log(
        `   👤 Name: ${participant.firstname} ${participant.lastname}`,
      );
      console.log(
        `   📎 Contact Sheet: ${participant.contactSheetKey || "NOT AVAILABLE"}`,
      );
      console.log(
        `   📨 Previously Sent: ${"contactSheetSent" in participant ? (participant.contactSheetSent ? "YES" : "NO") : "N/A (test data)"}`,
      );
      console.log("");
    });

    if (options.test) {
      console.log(
        "🧪 This preview used TEST DATA with hardcoded participants.",
      );
    }
  } catch (error) {
    console.error("❌ Preview failed:", error);
  }
}

async function sendTestEmail(participantIdStr: string): Promise<void> {
  const participantId = parseInt(participantIdStr);
  if (isNaN(participantId)) {
    console.error("❌ Invalid participant ID. Please provide a valid number.");
    return;
  }

  try {
    console.log(`🧪 Sending test email to participant ${participantId}`);

    const participant = await getParticipantById(participantId);
    if (!participant) {
      console.error(`❌ Participant ${participantId} not found`);
      return;
    }

    const result = await sendContactSheetEmail(
      participant,
      "Test Marathon 2025",
      "test@blikka.app",
    );

    if (result.success) {
      console.log(`✅ Test email sent successfully to ${participant.email}`);
    } else {
      console.error(`❌ Failed to send test email: ${result.error}`);
    }
  } catch (error) {
    console.error("❌ Test email failed:", error);
  }
}

async function showMarathonStatus(marathonIdStr: string): Promise<void> {
  const marathonId = parseInt(marathonIdStr);
  if (isNaN(marathonId)) {
    console.error("❌ Invalid marathon ID. Please provide a valid number.");
    return;
  }

  try {
    console.log(`📊 Getting status for marathon ${marathonId}...`);

    const stats = await getMarathonEmailStats(marathonId);

    console.log(`\n📊 MARATHON ${marathonId} - EMAIL STATUS`);
    console.log("=".repeat(40));
    console.log(`👥 Total verified participants: ${stats.totalVerified}`);
    console.log(`📎 With contact sheets: ${stats.withContactSheets}`);
    console.log(`✅ Contact sheets sent: ${stats.contactSheetsSent}`);
    console.log(`⏳ Pending emails: ${stats.pending}`);

    if (stats.totalVerified > 0) {
      const completionRate = Math.round(
        (stats.contactSheetsSent / stats.totalVerified) * 100,
      );
      console.log(`📈 Completion rate: ${completionRate}%`);
    }
  } catch (error) {
    console.error("❌ Failed to get marathon status:", error);
  }
}

export const emailTool: Tool = {
  name: "email",
  description: "Send contact sheet emails to verified participants",
  register: (program: Command) => {
    const emailCommand = program
      .command("email")
      .description("Email management tools for contact sheets");

    emailCommand
      .command("send-contact-sheets")
      .description("Send contact sheets to verified participants")
      .argument("<marathon-id>", "marathon ID")
      .option(
        "-l, --limit <number>",
        "limit number of emails to send",
        parseInt,
      )
      .option("-t, --test", "use test data with hardcoded participants")
      .option(
        "--no-skip-sent",
        "include participants who already received emails",
      )
      .option("-f, --from <email>", "sender email address")
      .action(sendContactSheets);

    emailCommand
      .command("preview-contact-sheets")
      .description("Preview what emails would be sent")
      .argument("<marathon-id>", "marathon ID")
      .option("-l, --limit <number>", "limit number to preview", parseInt)
      .option("-t, --test", "use test data with hardcoded participants")
      .option(
        "--no-skip-sent",
        "include participants who already received emails",
      )
      .action(previewContactSheets);

    emailCommand
      .command("test")
      .description("Send test email to specific participant")
      .argument("<participant-id>", "participant ID")
      .action(sendTestEmail);

    emailCommand
      .command("status")
      .description("Show email status for marathon")
      .argument("<marathon-id>", "marathon ID")
      .action(showMarathonStatus);
  },
};
