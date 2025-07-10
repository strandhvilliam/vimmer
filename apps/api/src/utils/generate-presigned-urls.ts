import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { eq, inArray } from "drizzle-orm";
import type { Database } from "../db";
import {
  marathons,
  competitionClasses,
  topics,
  submissions,
  participants,
} from "../db/schema";
import type { Submission, Topic, NewSubmission } from "../db/types";

export interface PresignedSubmission {
  presignedUrl: string;
  key: string;
  orderIndex: number;
  topicId: number;
  submissionId: number;
}

export interface GeneratePresignedUrlsParams {
  participantRef: string;
  domain: string;
  participantId: number;
  competitionClassId: number;
}

export function formatSubmissionKey({
  ref,
  index,
  domain,
}: {
  domain: string;
  ref: string;
  index: number;
}) {
  const trimmedRef = ref.trim();
  const isOnlyDigits = /^\d+$/.test(trimmedRef);
  const displayRef = isOnlyDigits ? trimmedRef.padStart(4, "0") : trimmedRef;
  const displayIndex = (index + 1).toString().padStart(2, "0");
  const fileName = `${displayRef}_${displayIndex}.jpg`;
  return `${domain}/${displayRef}/${displayIndex}/${fileName}`;
}

export async function generatePresignedUrl(
  s3Client: S3Client,
  key: string,
  bucketName: string
) {
  try {
    return await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Key: key,
        Bucket: bucketName,
      })
    );
  } catch (error: unknown) {
    console.error(error);
    throw new Error(`Failed to generate presigned URL for submission ${key}`);
  }
}

export class PresignedSubmissionService {
  constructor(
    private readonly db: Database,
    private readonly s3: S3Client,
    private readonly submissionBucketName: string
  ) {}

  async generatePresignedSubmissions(
    participantRef: string,
    domain: string,
    participantId: number,
    competitionClassId: number
  ): Promise<PresignedSubmission[]> {
    // Get marathon by domain
    const marathon = await this.db.query.marathons.findFirst({
      where: eq(marathons.domain, domain),
    });

    if (!marathon) {
      throw new Error("Marathon not found");
    }

    // Get competition classes for the domain
    const competitionClassesList =
      await this.db.query.competitionClasses.findMany({
        where: eq(competitionClasses.marathonId, marathon.id),
      });

    const competitionClass = competitionClassesList.find(
      (cc) => cc.id === competitionClassId
    );

    if (!competitionClass) {
      throw new Error("Competition class not found");
    }

    // Get topics ordered by order index
    const orderedTopics = await this.db.query.topics.findMany({
      where: eq(topics.marathonId, marathon.id),
      orderBy: (topics, { asc }) => [asc(topics.orderIndex)],
    });

    const submissionKeys = this.generateSubmissionKeys(
      participantRef,
      domain,
      competitionClass.numberOfPhotos
    );

    // Get existing submissions
    const existingSubmissions = await this.db.query.submissions.findMany({
      where: inArray(submissions.key, submissionKeys),
    });

    if (existingSubmissions.length < competitionClass.numberOfPhotos) {
      return this.handleNewSubmissions(
        existingSubmissions,
        submissionKeys,
        orderedTopics,
        marathon.id,
        participantId
      );
    }

    return this.generatePresignedObjects(existingSubmissions, orderedTopics);
  }

  private generateSubmissionKeys(
    participantRef: string,
    domain: string,
    numberOfPhotos: number
  ): string[] {
    return Array.from({ length: numberOfPhotos }).map((_, index) => {
      return formatSubmissionKey({
        ref: participantRef,
        index,
        domain,
      });
    });
  }

  private async handleNewSubmissions(
    existingSubmissions: Submission[],
    submissionKeys: string[],
    orderedTopics: Topic[],
    marathonId: number,
    participantId: number
  ): Promise<PresignedSubmission[]> {
    // Update participant upload count
    await this.db
      .update(participants)
      .set({ uploadCount: 0 })
      .where(eq(participants.id, participantId));

    const keysToCreate = submissionKeys.filter(
      (key) => !existingSubmissions.some((submission) => submission.key === key)
    );

    // Create new submissions
    const submissionsToCreate: NewSubmission[] = keysToCreate.map((key) => {
      const originalIndex = submissionKeys.findIndex((k) => k === key);
      const topicId = orderedTopics[originalIndex]?.id;

      if (!topicId) {
        throw new Error(
          `Unable to determine topic id for submission at index ${originalIndex}`
        );
      }

      return {
        key,
        marathonId,
        participantId,
        topicId,
        status: "initialized",
      };
    });

    const createdSubmissions = await this.db
      .insert(submissions)
      .values(submissionsToCreate)
      .returning();

    // Get all submissions for this participant
    const allSubmissions = await this.db.query.submissions.findMany({
      where: inArray(
        submissions.id,
        createdSubmissions.map((s) => s.id)
      ),
    });

    return this.generatePresignedObjects(allSubmissions, orderedTopics);
  }

  private async generatePresignedObjects(
    submissionsList: Submission[],
    orderedTopics: Topic[]
  ): Promise<PresignedSubmission[]> {
    const presignedObjects = await Promise.all(
      submissionsList.map(async (submission) => {
        const orderIndex = orderedTopics.findIndex(
          (t) => t.id === submission.topicId
        );
        const presignedUrl = await generatePresignedUrl(
          this.s3,
          submission.key,
          this.submissionBucketName
        );
        return {
          presignedUrl,
          key: submission.key,
          orderIndex,
          topicId: submission.topicId,
          submissionId: submission.id,
        };
      })
    );

    return presignedObjects.sort((a, b) => a.orderIndex - b.orderIndex);
  }
}
