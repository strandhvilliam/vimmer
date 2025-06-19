import { S3Client } from "@aws-sdk/client-s3";
import { SupabaseClient } from "@supabase/supabase-js";
import { formatSubmissionKey } from "@/lib/utils";
import { generatePresignedUrl } from "@/lib/generate-presigned-url";
import {
  createMultipleSubmissions,
  updateParticipant,
} from "@vimmer/supabase/mutations";
import {
  getMarathonByDomain,
  getCompetitionClassesByDomain,
  getTopicsByDomain,
} from "@vimmer/supabase/cached-queries";
import { getManySubmissionsByKeysQuery } from "@vimmer/supabase/queries";
import { PresignedSubmission } from "@/lib/types";
import { Submission, Topic } from "@vimmer/supabase/types";
import { Resource } from "sst";

export class PresignedSubmissionService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly s3: S3Client
  ) {}

  async generatePresignedSubmissions(
    participantRef: string,
    domain: string,
    participantId: string,
    competitionClassId: string
  ): Promise<PresignedSubmission[]> {
    const [marathon, competitionClasses, topics] = await Promise.all([
      getMarathonByDomain(domain),
      getCompetitionClassesByDomain(domain),
      getTopicsByDomain(domain),
    ]);

    if (!marathon) {
      throw new Error("Marathon not found");
    }

    const competitionClass = competitionClasses.find(
      (cc) => cc.id === parseInt(competitionClassId)
    );

    if (!competitionClass) {
      throw new Error("Competition class not found");
    }

    const orderedTopics = topics.sort((a, b) => a.orderIndex - b.orderIndex);
    const submissionKeys = this.generateSubmissionKeys(
      participantRef,
      domain,
      competitionClass.numberOfPhotos
    );

    const existingSubmissions = await getManySubmissionsByKeysQuery(
      this.supabase,
      submissionKeys
    );

    if (existingSubmissions.length < competitionClass.numberOfPhotos) {
      return this.handleNewSubmissions(
        existingSubmissions,
        submissionKeys,
        orderedTopics,
        marathon.id,
        parseInt(participantId)
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
    await updateParticipant(this.supabase, participantId, {
      uploadCount: 0,
    });

    const keysToCreate = submissionKeys.filter(
      (key) => !existingSubmissions.some((submission) => submission.key === key)
    );

    const newSubmissions = await createMultipleSubmissions(
      this.supabase,
      keysToCreate.map((key) => {
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
      })
    );

    const allSubmissions = [...existingSubmissions, ...newSubmissions];
    return this.generatePresignedObjects(allSubmissions, orderedTopics);
  }

  private async generatePresignedObjects(
    submissions: Submission[],
    orderedTopics: Topic[]
  ): Promise<PresignedSubmission[]> {
    const presignedObjects = await Promise.all(
      submissions.map(async (submission) => {
        const orderIndex = orderedTopics.findIndex(
          (t) => t.id === submission.topicId
        );
        const presignedUrl = await generatePresignedUrl(
          this.s3,
          submission.key,
          Resource.SubmissionBucket.name
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
