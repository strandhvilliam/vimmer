import { db } from "./db";
import {
  getReadyToUploadParticipants,
  updateSubmissionStatus,
  updateParticipantStatus,
  getAllParticipantsByReference,
  deleteParticipantById,
  getSubmissionsByParticipantId,
  getDetailedSubmissionsByParticipantId,
  updateSubmissionKey,
  type ParticipantWithDetails,
} from "./utils/queries";
import {
  checkS3ObjectMetadata,
  validateSubmissionKey,
} from "./utils/s3-checker";

interface ProcessingReport {
  domain: string;
  timestamp: string;
  totalParticipantsFound: number;
  totalParticipantsProcessed: number;
  participantsCompleted: number;
  submissionsUpdated: number;
  submissionKeysCopied: number;
  duplicatesDeleted: number;
  errors: Array<{
    participantId: number;
    reference: string;
    error: string;
  }>;
  participants: Array<{
    id: number;
    reference: string;
    status: "completed" | "partial" | "failed" | "optimized";
    submissionsProcessed: number;
    submissionsUploaded: number;
    requiredSubmissions: number;
  }>;
}

export async function processUploads(
  domain: string,
  reference?: string,
): Promise<ProcessingReport> {
  const startTime = new Date();
  const referenceInfo = reference ? ` and reference: ${reference}` : "";
  console.log(
    `🚀 Starting upload processing for domain: ${domain}${referenceInfo}`,
  );

  const report: ProcessingReport = {
    domain,
    timestamp: startTime.toISOString(),
    totalParticipantsFound: 0,
    totalParticipantsProcessed: 0,
    participantsCompleted: 0,
    submissionsUpdated: 0,
    submissionKeysCopied: 0,
    duplicatesDeleted: 0,
    errors: [],
    participants: [],
  };

  try {
    // Get submission bucket name from environment
    const submissionBucketName = process.env.SUBMISSION_BUCKET_NAME;
    if (!submissionBucketName) {
      throw new Error(
        "SUBMISSION_BUCKET_NAME environment variable is required",
      );
    }

    // Fetch participants ready to upload (max 10)
    const participants = await getReadyToUploadParticipants(
      db,
      domain,
      214,
      reference,
    );
    report.totalParticipantsFound = participants.length;

    const referenceFilter = reference ? ` for reference: ${reference}` : "";
    console.log(
      `📋 Found ${participants.length} participants ready to process${referenceFilter}`,
    );

    for (const participant of participants) {
      console.log(
        `\n👤 Processing participant: ${participant.reference} (ID: ${participant.id})`,
      );

      try {
        // If participant is already completed/verified, just clean up duplicates
        if (
          participant.status === "completed" ||
          participant.status === "verified"
        ) {
          console.log(
            `  ✅ Participant ${participant.reference} already ${participant.status}, cleaning up duplicates...`,
          );

          try {
            const deletedCount = await cleanupDuplicateParticipants(
              participant.reference,
              participant.id,
              domain,
            );
            report.duplicatesDeleted += deletedCount;
            if (deletedCount > 0) {
              console.log(
                `  🧹 Cleaned up ${deletedCount} duplicate participants for reference ${participant.reference}`,
              );
            }
          } catch (cleanupError) {
            console.warn(
              `  ⚠️ Error during cleanup for ${participant.reference}:`,
              cleanupError,
            );
          }

          report.totalParticipantsProcessed++;
          continue; // Skip actual processing
        }

        // Check if this participant needs submission key copying from older participants
        const optimizationResult = await optimizeParticipantSubmissions(
          participant,
          domain,
          submissionBucketName,
        );

        report.submissionKeysCopied += optimizationResult.keysCopied;

        const result = await processParticipant(
          optimizationResult.participant,
          submissionBucketName,
        );

        report.participants.push({
          id: participant.id,
          reference: participant.reference,
          status: result.status,
          submissionsProcessed: result.submissionsProcessed,
          submissionsUploaded: result.submissionsUploaded,
          requiredSubmissions: result.requiredSubmissions,
        });

        report.submissionsUpdated += result.submissionsUpdated;

        if (result.status === "completed") {
          report.participantsCompleted++;

          // Clean up duplicate participants for this reference
          try {
            const deletedCount = await cleanupDuplicateParticipants(
              participant.reference,
              participant.id,
              domain,
            );
            report.duplicatesDeleted += deletedCount;
            if (deletedCount > 0) {
              console.log(
                `  🧹 Cleaned up ${deletedCount} duplicate participants for reference ${participant.reference}`,
              );
            }
          } catch (cleanupError) {
            console.warn(
              `  ⚠️ Error during cleanup for ${participant.reference}:`,
              cleanupError,
            );
          }
        }

        report.totalParticipantsProcessed++;
      } catch (error) {
        console.error(
          `❌ Error processing participant ${participant.reference}:`,
          error,
        );

        report.errors.push({
          participantId: participant.id,
          reference: participant.reference,
          error: error instanceof Error ? error.message : String(error),
        });

        // Still track this participant in the report with failed status
        report.participants.push({
          id: participant.id,
          reference: participant.reference,
          status: "failed",
          submissionsProcessed: 0,
          submissionsUploaded: 0,
          requiredSubmissions:
            participant.competitionClass?.numberOfPhotos || 0,
        });
      }
    }

    const duration = Date.now() - startTime.getTime();

    // Print comprehensive summary
    console.log(`\n📊 PROCESSING SUMMARY`);
    console.log(`   Domain: ${domain}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Participants found: ${report.totalParticipantsFound}`);
    console.log(
      `   Participants processed: ${report.totalParticipantsProcessed}`,
    );
    console.log(`   Participants completed: ${report.participantsCompleted}`);
    console.log(`   Submissions updated: ${report.submissionsUpdated}`);
    console.log(`   Submission keys copied: ${report.submissionKeysCopied}`);
    console.log(`   Duplicates cleaned up: ${report.duplicatesDeleted}`);

    if (report.errors.length > 0) {
      console.log(`\n❌ ERRORS (${report.errors.length}):`);
      for (const error of report.errors) {
        console.log(
          `   • ${error.reference} (ID: ${error.participantId}): ${error.error}`,
        );
      }
    }

    const statusCounts = report.participants.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    if (Object.keys(statusCounts).length > 0) {
      console.log(`\n📈 PARTICIPANT STATUS:`);
      for (const [status, count] of Object.entries(statusCounts)) {
        console.log(`   • ${status}: ${count}`);
      }
    }

    console.log(`\n✅ Processing completed successfully`);
    return report;
  } catch (error) {
    console.error(`💥 Fatal error during processing:`, error);

    report.errors.push({
      participantId: -1,
      reference: "SYSTEM",
      error: error instanceof Error ? error.message : String(error),
    });

    return report;
  }
}

interface ParticipantProcessingResult {
  status: "completed" | "partial" | "failed";
  submissionsProcessed: number;
  submissionsUploaded: number;
  submissionsUpdated: number;
  requiredSubmissions: number;
}

interface OptimizationResult {
  participant: ParticipantWithDetails;
  keysCopied: number;
}

async function processParticipant(
  participant: ParticipantWithDetails,
  bucketName: string,
): Promise<ParticipantProcessingResult> {
  const result: ParticipantProcessingResult = {
    status: "failed",
    submissionsProcessed: 0,
    submissionsUploaded: 0,
    submissionsUpdated: 0,
    requiredSubmissions: 0,
  };

  // Validate competition class and submission count
  if (!participant.competitionClass) {
    throw new Error(
      `Participant ${participant.reference} has no competition class assigned`,
    );
  }

  const requiredSubmissions = participant.competitionClass.numberOfPhotos;
  result.requiredSubmissions = requiredSubmissions;

  // Handle edge case: no submissions
  if (participant.submissions.length === 0) {
    console.log(
      `  ⚠️ Participant ${participant.reference} has 0 submissions (requires ${requiredSubmissions})`,
    );
    result.status = "failed";
    return result;
  }

  if (participant.submissions.length !== requiredSubmissions) {
    console.log(
      `  ⚠️ Participant ${participant.reference} has ${participant.submissions.length} submissions, but requires ${requiredSubmissions}`,
    );
    // Don't throw error, just mark as failed and continue
    result.status = "failed";
    return result;
  }

  console.log(
    `  📊 Checking ${participant.submissions.length} submissions against S3...`,
  );

  // Process each submission
  for (const submission of participant.submissions) {
    result.submissionsProcessed++;

    console.log(`    🔍 Checking submission: ${submission.key}`);

    // Validate submission key format
    if (!validateSubmissionKey(submission.key)) {
      console.warn(`    ⚠️ Invalid submission key format: ${submission.key}`);
      continue;
    }

    // Check if submission exists in S3
    const s3Metadata = await checkS3ObjectMetadata(bucketName, submission.key);

    if (s3Metadata.exists && s3Metadata.isFile) {
      console.log(`    ✅ File exists in S3 (${s3Metadata.size} bytes)`);

      // Update submission status to 'uploaded' if not already
      if (submission.status !== "uploaded") {
        await updateSubmissionStatus(db, submission.id, "uploaded");
        result.submissionsUpdated++;
        console.log(`    📝 Updated submission status to 'uploaded'`);
      }

      result.submissionsUploaded++;
    } else {
      console.log(`    ❌ File not found in S3: ${submission.key}`);
    }
  }

  // Determine final status
  if (result.submissionsUploaded === requiredSubmissions) {
    // All submissions are uploaded, mark participant as completed
    await updateParticipantStatus(db, participant.id, "completed");
    result.status = "completed";
    console.log(
      `  🎉 Participant ${participant.reference} marked as completed`,
    );
  } else if (result.submissionsUploaded > 0) {
    result.status = "partial";
    console.log(
      `  ⏳ Participant ${participant.reference} has partial uploads (${result.submissionsUploaded}/${requiredSubmissions})`,
    );
  } else {
    result.status = "failed";
    console.log(
      `  ❌ Participant ${participant.reference} has no valid uploads`,
    );
  }

  return result;
}

async function cleanupDuplicateParticipants(
  reference: string,
  completedParticipantId: number,
  domain: string,
): Promise<number> {
  console.log(
    `    🔍 Checking for duplicate participants with reference: ${reference}`,
  );

  // Get all participants with this reference
  const allParticipants = await getAllParticipantsByReference(
    db,
    reference,
    domain,
  );

  if (allParticipants.length <= 1) {
    console.log(
      `    ✅ Only one participant found for reference: ${reference} - no cleanup needed`,
    );
    return 0;
  }

  console.log(
    `    📋 Found ${allParticipants.length} participants with reference: ${reference}`,
  );

  // Find the completed participant (should be the most recent one we just processed)
  const completedParticipant = allParticipants.find(
    (p) => p.id === completedParticipantId,
  );

  if (!completedParticipant) {
    console.warn(
      `    ⚠️ Could not find completed participant ${completedParticipantId} in duplicate list`,
    );
    return 0;
  }

  if (
    completedParticipant.status !== "completed" &&
    completedParticipant.status !== "verified"
  ) {
    console.warn(
      `    ⚠️ Participant ${completedParticipantId} is not completed/verified (status: ${completedParticipant.status})`,
    );
    return 0;
  }

  // Get all submissions for the completed participant to ensure they're all uploaded
  const completedSubmissions = await getSubmissionsByParticipantId(
    db,
    completedParticipantId,
  );

  // For verified participants, we don't need to check submission status
  if (completedParticipant.status === "verified") {
    console.log(
      `    ✅ Verified participant ${completedParticipantId} - skipping submission status check`,
    );
  } else {
    // For completed participants, check that all submissions are uploaded
    const allUploaded = completedSubmissions.every(
      (s) => s.status === "uploaded",
    );

    if (!allUploaded) {
      console.warn(
        `    ⚠️ Not all submissions are uploaded for participant ${completedParticipantId}`,
      );
      return 0;
    }

    console.log(
      `    ✅ Verified completed participant ${completedParticipantId} has all submissions uploaded`,
    );
  }

  // Filter participants eligible for deletion:
  // 1. Not the completed participant
  // 2. Only 'initialized' or 'ready_to_upload' status
  // 3. Older than the completed participant
  const allowedStatusesForDeletion = ["initialized", "ready_to_upload"];
  const completedDate = new Date(completedParticipant.createdAt);

  const participantsToDelete = allParticipants.filter((p) => {
    if (p.id === completedParticipantId) {
      return false; // Don't delete the completed participant
    }

    if (!allowedStatusesForDeletion.includes(p.status)) {
      console.log(
        `    ⚠️ Skipping participant ${p.id} - status '${p.status}' not eligible for deletion`,
      );
      return false;
    }

    const deleteDate = new Date(p.createdAt);
    if (deleteDate > completedDate) {
      console.log(
        `    ⚠️ Skipping participant ${p.id} - it's newer than completed participant`,
      );
      return false;
    }

    return true;
  });

  if (participantsToDelete.length === 0) {
    console.log(`    ✅ No eligible participants found for deletion`);
    return 0;
  }

  // Final safety check: ensure we're not deleting all participants (leaving at least the completed one)
  const remainingAfterDeletion =
    allParticipants.length - participantsToDelete.length;
  if (remainingAfterDeletion < 1) {
    console.warn(
      `    ⚠️ Safety check failed: deletion would leave ${remainingAfterDeletion} participants`,
    );
    return 0;
  }

  console.log(
    `    🗑️ Eligible for deletion: ${participantsToDelete.length} participants`,
  );

  let deletedCount = 0;

  for (const participantToDelete of participantsToDelete) {
    try {
      console.log(
        `    🗑️ Deleting participant ${participantToDelete.id} (status: ${participantToDelete.status}, created: ${participantToDelete.createdAt})`,
      );

      await deleteParticipantById(db, participantToDelete.id);
      deletedCount++;
      console.log(`    ✅ Deleted participant ${participantToDelete.id}`);
    } catch (error) {
      console.error(
        `    ❌ Error deleting participant ${participantToDelete.id}:`,
        error,
      );
    }
  }

  return deletedCount;
}

async function optimizeParticipantSubmissions(
  participant: ParticipantWithDetails,
  domain: string,
  bucketName: string,
): Promise<OptimizationResult> {
  console.log(
    `  🔍 Checking if participant ${participant.reference} needs submission optimization...`,
  );

  // If participant has no submissions, we can't optimize
  if (participant.submissions.length === 0) {
    console.log(
      `  ⚠️ Participant ${participant.reference} has no submissions to optimize`,
    );
    return { participant, keysCopied: 0 };
  }

  // Check if current participant has valid S3 files
  const currentSubmissionsInS3 = await countValidS3Submissions(
    participant.submissions,
    bucketName,
  );

  console.log(
    `  📊 Current participant has ${currentSubmissionsInS3}/${participant.submissions.length} submissions in S3`,
  );

  // If most submissions are already in S3, no need to optimize
  const requiredSubmissions =
    participant.competitionClass?.numberOfPhotos ||
    participant.submissions.length;
  if (currentSubmissionsInS3 >= requiredSubmissions * 0.8) {
    // 80% threshold
    console.log(
      `  ✅ Current participant has sufficient S3 files (${currentSubmissionsInS3}/${requiredSubmissions})`,
    );
    return { participant, keysCopied: 0 };
  }

  console.log(
    `  🔄 Current participant has insufficient S3 files, checking older participants...`,
  );

  // Get all participants with this reference to check older ones
  const allParticipants = await getAllParticipantsByReference(
    db,
    participant.reference,
    domain,
  );

  // Sort by creation date (newest first) and exclude current participant
  const olderParticipants = allParticipants
    .filter((p) => p.id !== participant.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  for (const olderParticipant of olderParticipants) {
    console.log(
      `  🕵️ Checking older participant ${olderParticipant.id} (created: ${olderParticipant.createdAt})...`,
    );

    // Get detailed submissions for older participant
    const olderSubmissions = await getDetailedSubmissionsByParticipantId(
      db,
      olderParticipant.id,
    );

    if (olderSubmissions.length !== requiredSubmissions) {
      console.log(
        `  ⚠️ Older participant has ${olderSubmissions.length}/${requiredSubmissions} submissions, skipping`,
      );
      continue;
    }

    // Check if older participant has all files in S3
    const olderSubmissionsInS3 = await countValidS3Submissions(
      olderSubmissions,
      bucketName,
    );

    console.log(
      `  📊 Older participant has ${olderSubmissionsInS3}/${olderSubmissions.length} submissions in S3`,
    );

    if (olderSubmissionsInS3 === requiredSubmissions) {
      console.log(
        `  🎯 Found complete older participant! Copying submission keys...`,
      );

      // Copy submission keys from older participant to current participant
      await copySubmissionKeys(participant.submissions, olderSubmissions);

      // Refresh current participant data
      const refreshedSubmissions = await getDetailedSubmissionsByParticipantId(
        db,
        participant.id,
      );

      console.log(
        `  ✅ Successfully copied ${olderSubmissions.length} submission keys`,
      );

      return {
        participant: {
          ...participant,
          submissions: refreshedSubmissions.map((s) => ({
            id: s.id,
            key: s.key,
            status: s.status,
            participantId: participant.id,
          })),
        },
        keysCopied: olderSubmissions.length,
      };
    }
  }

  console.log(`  ❌ No older participant found with complete S3 uploads`);
  return { participant, keysCopied: 0 };
}

async function countValidS3Submissions(
  submissions: Array<{ key: string }>,
  bucketName: string,
): Promise<number> {
  let validCount = 0;

  for (const submission of submissions) {
    if (!validateSubmissionKey(submission.key)) {
      continue;
    }

    const s3Metadata = await checkS3ObjectMetadata(bucketName, submission.key);
    if (s3Metadata.exists && s3Metadata.isFile) {
      validCount++;
    }
  }

  return validCount;
}

async function copySubmissionKeys(
  currentSubmissions: Array<{ id: number; key: string }>,
  sourceSubmissions: Array<{ id: number; key: string; topicId: number }>,
): Promise<void> {
  // Create a mapping of topic to source key
  const topicToKeyMap = new Map<number, string>();
  for (const sourceSubmission of sourceSubmissions) {
    topicToKeyMap.set(sourceSubmission.topicId, sourceSubmission.key);
  }

  // Get detailed info for current submissions to match by topic
  for (const currentSubmission of currentSubmissions) {
    // Get topic ID for current submission
    const currentDetails = await db.query.submissions.findFirst({
      where: (submissions, { eq }) => eq(submissions.id, currentSubmission.id),
      columns: { topicId: true },
    });

    if (!currentDetails) {
      console.warn(
        `    ⚠️ Could not find details for submission ${currentSubmission.id}`,
      );
      continue;
    }

    const sourceKey = topicToKeyMap.get(currentDetails.topicId);
    if (sourceKey && sourceKey !== currentSubmission.key) {
      console.log(
        `    📝 Updating submission ${currentSubmission.id}: ${currentSubmission.key} → ${sourceKey}`,
      );
      await updateSubmissionKey(db, currentSubmission.id, sourceKey);
    }
  }
}
