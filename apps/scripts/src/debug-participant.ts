import { db } from "./db";
import { participants, submissions } from "@vimmer/api/db/schema";
import { eq, and } from "drizzle-orm";

async function debugParticipant(reference: string, domain: string) {
  console.log(
    `🔍 Debugging participant reference: ${reference} in domain: ${domain}`,
  );

  // Get all participants with this reference
  const allParticipants = await db
    .select({
      id: participants.id,
      reference: participants.reference,
      status: participants.status,
      createdAt: participants.createdAt,
      domain: participants.domain,
    })
    .from(participants)
    .where(
      and(
        eq(participants.reference, reference),
        eq(participants.domain, domain),
      ),
    )
    .orderBy(participants.createdAt);

  console.log(`\n📋 Found ${allParticipants.length} participants:`);

  for (const participant of allParticipants) {
    // Get submission count for each participant
    const submissionCount = await db
      .select({ count: submissions.id })
      .from(submissions)
      .where(eq(submissions.participantId, participant.id));

    console.log(
      `  ID: ${participant.id} | Status: ${participant.status} | Created: ${participant.createdAt} | Submissions: ${submissionCount.length}`,
    );
  }

  // Check which one would be selected by our current logic
  const latestParticipant = allParticipants
    .filter((p) => p.status === "ready_to_upload")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  if (latestParticipant) {
    console.log(
      `\n🎯 Current logic would select: ID ${latestParticipant.id} (${latestParticipant.status})`,
    );
  } else {
    console.log(`\n❌ No participant with 'ready_to_upload' status found`);
  }
}

if (import.meta.main) {
  const reference = process.argv[2];
  const domain = process.argv[3] || "fotomaran";

  if (!reference) {
    console.error("Usage: bun debug-participant.ts <reference> [domain]");
    process.exit(1);
  }

  debugParticipant(reference, domain);
}
