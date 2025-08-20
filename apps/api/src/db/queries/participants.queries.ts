import { eq, and, desc, asc, ilike, or, count, inArray } from "drizzle-orm"
import type { Database } from "@vimmer/api/db"
import {
  participants,
  participantVerifications,
  submissions,
  validationResults,
  zippedSubmissions,
} from "@vimmer/api/db/schema"
import type { NewParticipant } from "@vimmer/api/db/types"
import { TRPCError } from "@trpc/server"
import type { SupabaseClient } from "@vimmer/supabase/types"

export async function getParticipantByIdQuery(
  db: Database,
  { id }: { id: number }
) {
  const result = await db.query.participants.findFirst({
    where: eq(participants.id, id),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
      zippedSubmission: true,
    },
  })

  return result
}

export async function getParticipantsWithoutSubmissionsQuery(
  db: Database,
  { domain }: { domain: string }
) {
  const result = await db.query.participants.findMany({
    where: eq(participants.domain, domain),
    with: {
      competitionClass: true,
      deviceGroup: true,
      zippedSubmission: true,
    },
  })

  return result
}

export async function getParticipantByReferenceQuery(
  db: Database,
  { reference, domain }: { reference: string; domain: string }
) {
  const result = await db.query.participants.findFirst({
    where: and(
      eq(participants.reference, reference),
      eq(participants.domain, domain)
    ),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
      zippedSubmission: true,
    },
  })

  if (!result) {
    return null
  }

  return result
}

export async function getParticipantsByDomainQuery(
  db: Database,
  { domain }: { domain: string }
) {
  const result = await db.query.participants.findMany({
    where: eq(participants.domain, domain),
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
      zippedSubmission: true,
    },
  })

  return result
}

export async function getParticipantsByDomainPaginatedQuery(
  db: Database,
  {
    domain,
    page,
    pageSize,
    search,
    status,
    competitionClassId,
    deviceGroupId,
    sortBy,
    sortOrder,
  }: {
    domain: string
    page: number
    pageSize: number
    search?: string
    status?: string | string[]
    competitionClassId?: number | number[]
    deviceGroupId?: number | number[]
    sortBy: "createdAt" | "reference" | "firstname" | "lastname" | "uploadCount"
    sortOrder: "asc" | "desc"
  }
) {
  const offset = (page - 1) * pageSize

  // Build where conditions
  const whereConditions = [eq(participants.domain, domain)]

  if (status) {
    if (Array.isArray(status)) {
      whereConditions.push(inArray(participants.status, status))
    } else {
      whereConditions.push(eq(participants.status, status))
    }
  }

  if (competitionClassId) {
    if (Array.isArray(competitionClassId)) {
      whereConditions.push(
        inArray(participants.competitionClassId, competitionClassId)
      )
    } else {
      whereConditions.push(
        eq(participants.competitionClassId, competitionClassId)
      )
    }
  }

  if (deviceGroupId) {
    if (Array.isArray(deviceGroupId)) {
      whereConditions.push(inArray(participants.deviceGroupId, deviceGroupId))
    } else {
      whereConditions.push(eq(participants.deviceGroupId, deviceGroupId))
    }
  }

  if (search) {
    const searchPattern = `%${search}%`
    const searchCondition = or(
      ilike(participants.reference, searchPattern),
      ilike(participants.firstname, searchPattern),
      ilike(participants.lastname, searchPattern),
      ilike(participants.email, searchPattern)
    )
    if (searchCondition) {
      whereConditions.push(searchCondition)
    }
  }

  // Build order by
  const orderBy = []
  if (sortBy === "createdAt") {
    orderBy.push(
      sortOrder === "asc"
        ? asc(participants.createdAt)
        : desc(participants.createdAt)
    )
  } else if (sortBy === "reference") {
    orderBy.push(
      sortOrder === "asc"
        ? asc(participants.reference)
        : desc(participants.reference)
    )
  } else if (sortBy === "firstname") {
    orderBy.push(
      sortOrder === "asc"
        ? asc(participants.firstname)
        : desc(participants.firstname)
    )
  } else if (sortBy === "lastname") {
    orderBy.push(
      sortOrder === "asc"
        ? asc(participants.lastname)
        : desc(participants.lastname)
    )
  } else if (sortBy === "uploadCount") {
    orderBy.push(
      sortOrder === "asc"
        ? asc(participants.uploadCount)
        : desc(participants.uploadCount)
    )
  }

  // Get total count
  const totalCountResult = await db
    .select({ count: count() })
    .from(participants)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

  console.log("totalCountResult", totalCountResult)

  const totalCount = totalCountResult[0]?.count || 0

  // Get paginated results
  const result = await db.query.participants.findMany({
    where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
    with: {
      submissions: true,
      competitionClass: true,
      deviceGroup: true,
      validationResults: true,
      zippedSubmission: true,
    },
    orderBy,
    limit: pageSize,
    offset,
  })

  return {
    data: result,
    totalCount,
    page,
    pageSize,
    totalPages: Math.ceil(totalCount / pageSize),
  }
}

export async function createParticipantMutation(
  db: Database,
  { data }: { data: NewParticipant }
): Promise<{ id: number }> {
  if (!data.domain) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Domain is required",
    })
  }

  let existingParticipant
  try {
    existingParticipant = await getParticipantByReferenceQuery(db, {
      reference: data.reference,
      domain: data.domain,
    })
  } catch (error) {
    console.log("error", error)
  }

  // if (existingParticipant) {
  //   throw new TRPCError({
  //     code: "BAD_REQUEST",
  //     message: "Participant already exists",
  //   });
  // }

  const result = await db
    .insert(participants)
    .values(data)
    .returning({ id: participants.id })

  if (!result[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to create participant",
    })
  }

  return { id: result[0].id }
}

export async function updateParticipantMutation(
  db: Database,
  { id, data }: { id: number; data: Partial<NewParticipant> }
): Promise<{ id: number }> {
  const result = await db
    .update(participants)
    .set(data)
    .where(eq(participants.id, id))
    .returning({ id: participants.id })

  if (!result[0]) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to update participant",
    })
  }

  return { id: result[0].id }
}

export async function deleteParticipantMutation(
  db: Database,
  { id }: { id: number }
): Promise<{ id: number }> {
  await db
    .delete(validationResults)
    .where(eq(validationResults.participantId, id))

  await db
    .delete(participantVerifications)
    .where(eq(participantVerifications.participantId, id))

  await db.delete(submissions).where(eq(submissions.participantId, id))
  await db
    .delete(zippedSubmissions)
    .where(eq(zippedSubmissions.participantId, id))

  await db.delete(participants).where(eq(participants.id, id))

  return { id }
}

export async function getVerifiedParticipantsWithCompletePreviewKeysQuery(
  db: Database,
  { domain }: { domain: string }
) {
  // Get all verified participants with their submissions
  const verifiedParticipants = await db.query.participants.findMany({
    where: and(
      eq(participants.domain, domain),
      eq(participants.status, "verified")
    ),
    with: {
      submissions: {
        columns: {
          id: true,
          previewKey: true,
        },
      },
    },
    columns: {
      id: true,
      reference: true,
      firstname: true,
      lastname: true,
      contactSheetKey: true,
    },
  })

  // Filter participants who have all submissions with preview keys
  const readyParticipants = verifiedParticipants.filter((participant) => {
    // Must have at least one submission
    if (!participant.submissions || participant.submissions.length === 0) {
      return false
    }

    if (participant.contactSheetKey !== null) {
      return false
    }

    // All submissions must have preview keys
    return participant.submissions.every((submission) => submission.previewKey)
  })

  console.log(
    `Found ${verifiedParticipants.length} verified participants, ${readyParticipants.length} ready for bulk sheet generation`
  )

  return readyParticipants
}

export async function incrementUploadCounterMutation(
  supabase: SupabaseClient,
  {
    participantId,
    totalExpected,
  }: { participantId: number; totalExpected: number }
) {
  const resp = await supabase
    .rpc("increment_upload_counter", {
      participant_id: participantId,
      total_expected: totalExpected,
    })
    .throwOnError()

  const data = resp.data as {
    upload_count: number
    status: string
    is_complete: boolean
  }

  return {
    uploadCount: data.upload_count,
    status: data.status,
    isComplete: data.is_complete,
  }
}
