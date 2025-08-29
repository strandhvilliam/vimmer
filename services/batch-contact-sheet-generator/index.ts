import { createContactSheet } from "../contact-sheet-generator/src/contact-sheet";
import { db } from "@vimmer/api/db";
import {
  getParticipantByReferenceQuery,
  updateParticipantMutation,
} from "@vimmer/api/db/queries/participants.queries";
import { getTopicsByDomainQuery } from "@vimmer/api/db/queries/topics.queries";
import { getSponsorsByMarathonIdQuery } from "@vimmer/api/db/queries/sponsors.queries";

const VALID_PHOTO_COUNTS = [8, 24];

interface ProcessingResult {
  participantId: number;
  contactSheetKey: string;
  participantRef: string;
  status: "success" | "error";
  error?: string;
}

interface BatchProcessParams {
  domain: string;
  participantRefs: string[];
}

export async function batchProcessContactSheets({
  domain,
  participantRefs,
}: BatchProcessParams) {
  console.log(
    `Starting batch processing for ${participantRefs.length} participants`,
  );

  const results: ProcessingResult[] = [];
  const successfulUpdates: { id: number; contactSheetKey: string }[] = [];

  // Process all contact sheets first (generate and upload to S3)
  for (const participantRef of participantRefs) {
    try {
      console.log(`Processing participant: ${participantRef}`);

      const participant = await getParticipantByReferenceQuery(db, {
        reference: participantRef,
        domain,
      });

      if (!participant) {
        console.log(`Participant not found: ${participantRef}`);
        results.push({
          participantId: -1,
          contactSheetKey: "",
          participantRef,
          status: "error",
          error: "Participant not found",
        });
        continue;
      }

      const sponsors = await getSponsorsByMarathonIdQuery(db, {
        marathonId: participant.marathonId,
      });

      const sponsorKey = sponsors
        .filter((s: any) => s.type === "contact-sheets")
        .sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .at(-1)?.key;

      const topics = await getTopicsByDomainQuery(db, {
        domain,
      });

      const reducedTopics = topics.map((t: any) => ({
        name: t.name,
        orderIndex: t.orderIndex,
      }));

      const keys = participant.submissions.reduce((acc: string[], s: any) => {
        if (s.previewKey) {
          acc.push(s.previewKey);
        } else {
          console.log("Missing preview key, using normal", s.key);
          acc.push(s.key);
        }
        return acc;
      }, [] as string[]);

      if (keys.length !== participant.submissions.length) {
        console.log(`Missing preview keys for participant: ${participantRef}`);
        results.push({
          participantId: participant.id,
          contactSheetKey: "",
          participantRef,
          status: "error",
          error: "Missing preview keys",
        });
        continue;
      }

      if (
        participant.competitionClass?.numberOfPhotos &&
        !VALID_PHOTO_COUNTS.includes(
          participant.competitionClass.numberOfPhotos,
        )
      ) {
        console.log(`Invalid photo count for participant: ${participantRef}`);
        results.push({
          participantId: participant.id,
          contactSheetKey: "",
          participantRef,
          status: "error",
          error: "Invalid photo count",
        });
        continue;
      }

      // Generate and upload contact sheet to S3
      const contactSheetKey = await createContactSheet({
        keys,
        participantRef,
        domain,
        sponsorPosition: "bottom-right",
        sponsorKey,
        topics: reducedTopics,
        currentContactSheetKey: participant.contactSheetKey,
      });

      console.log(
        `Generated contact sheet for ${participantRef}: ${contactSheetKey}`,
      );

      results.push({
        participantId: participant.id,
        contactSheetKey,
        participantRef,
        status: "success",
      });

      // Store successful results for batch update
      successfulUpdates.push({
        id: participant.id,
        contactSheetKey,
      });
    } catch (error) {
      console.error(`Error processing participant ${participantRef}:`, error);
      results.push({
        participantId: -1,
        contactSheetKey: "",
        participantRef,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  console.log(
    `Finished processing. Starting batch database update for ${successfulUpdates.length} participants`,
  );

  // Perform batch database update for all successful generations
  const batchUpdateResults: Array<{
    participantId: number;
    status: "success" | "error";
    error?: string;
  }> = [];

  for (const update of successfulUpdates) {
    try {
      await updateParticipantMutation(db, {
        id: update.id,
        data: {
          contactSheetKey: update.contactSheetKey,
        },
      });

      console.log(
        `Updated participant ${update.id} with contact sheet key: ${update.contactSheetKey}`,
      );
      batchUpdateResults.push({
        participantId: update.id,
        status: "success",
      });
    } catch (error) {
      console.error(`Error updating participant ${update.id}:`, error);
      batchUpdateResults.push({
        participantId: update.id,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  const summary = {
    totalProcessed: participantRefs.length,
    successful: results.filter((r) => r.status === "success").length,
    failed: results.filter((r) => r.status === "error").length,
    dbUpdatesSuccessful: batchUpdateResults.filter(
      (r) => r.status === "success",
    ).length,
    dbUpdatesFailed: batchUpdateResults.filter((r) => r.status === "error")
      .length,
  };

  console.log("Batch processing summary:", summary);

  return {
    summary,
    processingResults: results,
    dbUpdateResults: batchUpdateResults,
  };
}

// Example usage function
export async function runBatchContactSheetGeneration() {
  const domain = "sthlm2025";
  const participantRefs = [
    "participant-1",
    "participant-2",
    "participant-3",
    // Add more participant references as needed
  ];

  try {
    const result = await batchProcessContactSheets({
      domain,
      participantRefs,
    });

    console.log("Final results:", result);
    return result;
  } catch (error) {
    console.error("Batch processing failed:", error);
    throw error;
  }
}
