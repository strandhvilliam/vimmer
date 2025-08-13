import { S3Client } from "@aws-sdk/client-s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { and, eq, inArray, not } from "drizzle-orm"
import type { Database } from "../db"
import {
  marathons,
  competitionClasses,
  topics,
  submissions,
  participants,
} from "../db/schema"
import type { Submission, Topic, NewSubmission } from "../db/types"
import { TRPCError } from "@trpc/server"

export interface PresignedSubmission {
  presignedUrl: string
  key: string
  orderIndex: number
  topicId: number
  submissionId: number
}

export interface GeneratePresignedUrlsParams {
  participantRef: string
  domain: string
  participantId: number
  competitionClassId: number
  preconvertedExifData: { orderIndex: number; exif: any }[]
}

export function formatSubmissionKey({
  ref,
  index,
  domain,
}: {
  domain: string
  ref: string
  index: number
}) {
  const trimmedRef = ref.trim()
  const isOnlyDigits = /^\d+$/.test(trimmedRef)
  const displayRef = isOnlyDigits ? trimmedRef.padStart(4, "0") : trimmedRef
  const displayIndex = (index + 1).toString().padStart(2, "0")
  const generatedDateTime = new Date().toISOString().replace(/[:.]/g, "-")
  const fileName = `${displayRef}_${displayIndex}_${generatedDateTime}.jpg`
  return `${domain}/${displayRef}/${displayIndex}/${fileName}`
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
        ContentType: "image/jpeg",
      }),
      {
        expiresIn: 3600,
      }
    )
  } catch (error: unknown) {
    console.error(error)
    throw new Error(`Failed to generate presigned URL for submission ${key}`)
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
    competitionClassId: number,
    preconvertedExifData: { orderIndex: number; exif: any }[]
  ): Promise<PresignedSubmission[]> {
    const marathon = await this.db.query.marathons.findFirst({
      where: eq(marathons.domain, domain),
    })

    if (!marathon) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Marathon not found",
      })
    }

    const competitionClassesList =
      await this.db.query.competitionClasses.findMany({
        where: eq(competitionClasses.marathonId, marathon.id),
      })

    const competitionClass = competitionClassesList.find(
      (cc) => cc.id === competitionClassId
    )

    if (!competitionClass) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Competition class not found",
      })
    }

    const orderedTopics = await this.db.query.topics.findMany({
      where: eq(topics.marathonId, marathon.id),
      orderBy: (topics, { asc }) => [asc(topics.orderIndex)],
    })

    // add start index handling
    const submissionKeys = this.generateSubmissionKeys(
      participantRef,
      domain,
      competitionClass.numberOfPhotos
    )

    const participant = await this.db.query.participants.findFirst({
      where: eq(participants.id, participantId),
      with: {
        submissions: true,
      },
    })

    if (!participant) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Participant not found",
      })
    }

    if (participant.submissions.length < competitionClass.numberOfPhotos) {
      return this.handleNewSubmissions(
        participant.submissions,
        submissionKeys,
        orderedTopics,
        marathon.id,
        participantId,
        preconvertedExifData
      )
    }

    if (participant.submissions.length > competitionClass.numberOfPhotos) {
      // delete the keys not in submissionKeys
      await this.db
        .delete(submissions)
        .where(
          and(
            eq(submissions.marathonId, marathon.id),
            not(inArray(submissions.key, submissionKeys))
          )
        )

      const newSubmissions = await this.db.query.submissions.findMany({
        where: inArray(submissions.key, submissionKeys),
      })
      return this.generatePresignedObjects(newSubmissions, orderedTopics)
    }

    if (preconvertedExifData.length > 0) {
      for (const submission of participant.submissions) {
        const parsedKey = this.parseKey(submission.key)
        if (!parsedKey) continue

        const preconvertedExif = preconvertedExifData.find(
          (p) => p.orderIndex === parseInt(parsedKey.orderIndex) - 1
        )
        if (preconvertedExif) {
          await this.db
            .update(submissions)
            .set({
              exif: preconvertedExif.exif,
              mimeType: "image/heic", // only heic files are preconverted
            })
            .where(eq(submissions.id, submission.id))
        }
      }
    }

    return this.generatePresignedObjects(participant.submissions, orderedTopics)
  }

  private parseKey(key: string) {
    const [domain, participantRef, orderIndex, fileName] = key.split("/")
    if (!domain || !participantRef || !orderIndex || !fileName) {
      return null
    }
    return { domain, participantRef, orderIndex, fileName }
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
      })
    })
  }

  private async handleNewSubmissions(
    existingSubmissions: Submission[],
    submissionKeys: string[],
    orderedTopics: Topic[],
    marathonId: number,
    participantId: number,
    preconvertedExifData: { orderIndex: number; exif: any }[]
  ): Promise<PresignedSubmission[]> {
    await this.db
      .update(participants)
      .set({ uploadCount: 0 })
      .where(eq(participants.id, participantId))

    const keysToCreate = submissionKeys.filter(
      (key) => !existingSubmissions.some((submission) => submission.key === key)
    )

    const submissionsToCreate: NewSubmission[] = keysToCreate.map((key) => {
      const originalIndex = submissionKeys.findIndex((k) => k === key)
      const topicId = orderedTopics[originalIndex]?.id
      const preconvertedExif = preconvertedExifData.find(
        (p) => p.orderIndex === originalIndex
      )

      if (!topicId) {
        throw new Error(
          `Unable to determine topic id for submission at index ${originalIndex}`
        )
      }

      return {
        key,
        marathonId,
        participantId,
        topicId,
        status: "initialized",
        exif: preconvertedExif ? preconvertedExif.exif : undefined,
        mimeType: preconvertedExif ? "image/heic" : undefined,
      }
    })

    await this.db.insert(submissions).values(submissionsToCreate)

    const allSubmissions = await this.db.query.submissions.findMany({
      where: eq(submissions.participantId, participantId),
    })

    return this.generatePresignedObjects(allSubmissions, orderedTopics)
  }

  private async generatePresignedObjects(
    submissionsList: Submission[],
    orderedTopics: Topic[]
  ): Promise<PresignedSubmission[]> {
    const presignedObjects = await Promise.all(
      submissionsList.map(async (submission) => {
        const orderIndex = orderedTopics.findIndex(
          (t) => t.id === submission.topicId
        )
        const presignedUrl = await generatePresignedUrl(
          this.s3,
          submission.key,
          this.submissionBucketName
        )
        return {
          presignedUrl,
          key: submission.key,
          orderIndex,
          topicId: submission.topicId,
          submissionId: submission.id,
        }
      })
    )

    return presignedObjects.sort((a, b) => a.orderIndex - b.orderIndex)
  }
}
