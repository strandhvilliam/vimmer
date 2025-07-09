import { eq, and } from "drizzle-orm";
import type { Database } from "@vimmer/api/db";
import { user, userMarathons, marathons } from "@vimmer/api/db/schema";
import type { NewUser, NewUserMarathonRelation } from "@vimmer/api/db/types";

export async function getUserByIdQuery(db: Database, { id }: { id: string }) {
  const result = await db.query.user.findFirst({
    where: eq(user.id, id),
  });
  return result ?? null;
}

export async function getUserWithMarathonsQuery(
  db: Database,
  { userId }: { userId: string }
) {
  const result = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      userMarathons: {
        with: {
          marathon: true,
        },
      },
    },
  });

  return result ?? null;
}

export async function getMarathonsByUserIdQuery(
  db: Database,
  { userId }: { userId: string }
) {
  const result = await db.query.userMarathons.findMany({
    where: eq(userMarathons.userId, userId),
    with: {
      marathon: true,
    },
  });

  return result.map((userMarathon) => userMarathon.marathon);
}

export async function getUserByEmailWithMarathonsQuery(
  db: Database,
  { email }: { email: string }
) {
  const result = await db.query.user.findFirst({
    where: eq(user.email, email),
    with: {
      userMarathons: true,
    },
  });

  return result ?? null;
}

export async function getStaffMembersByDomainQuery(
  db: Database,
  { domain }: { domain: string }
) {
  const result = await db.query.marathons.findFirst({
    where: eq(marathons.domain, domain),
    with: {
      userMarathons: {
        with: {
          user: true,
        },
      },
    },
  });

  return result?.userMarathons ?? [];
}

export async function getStaffMemberByIdQuery(
  db: Database,
  { staffId, domain }: { staffId: string; domain: string }
) {
  const marathon = await db.query.marathons.findFirst({
    where: eq(marathons.domain, domain),
    columns: { id: true },
  });

  if (!marathon) {
    return null;
  }

  const result = await db.query.user.findFirst({
    where: eq(user.id, staffId),
    with: {
      userMarathons: {
        where: eq(userMarathons.marathonId, marathon.id),
      },
      participantVerifications: {
        with: {
          participant: true,
        },
      },
    },
  });

  if (!result?.userMarathons[0]) {
    return null;
  }

  const filteredParticipantVerifications =
    result.participantVerifications.filter(
      (pv) => pv.participant.marathonId === marathon.id
    );

  return {
    ...result.userMarathons[0],
    user: {
      ...result,
      participantVerifications: filteredParticipantVerifications,
    },
  };
}

export async function createUserMutation(
  db: Database,
  { data }: { data: NewUser }
) {
  const result = await db.insert(user).values(data).returning({ id: user.id });
  return { id: result[0]?.id ?? null };
}

export async function updateUserMutation(
  db: Database,
  { id, data }: { id: string; data: Partial<NewUser> }
) {
  const result = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning({ id: user.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteUserMutation(db: Database, { id }: { id: string }) {
  const result = await db
    .delete(user)
    .where(eq(user.id, id))
    .returning({ id: user.id });
  return { id: result[0]?.id ?? null };
}

export async function createUserMarathonRelationMutation(
  db: Database,
  { data }: { data: NewUserMarathonRelation }
) {
  const result = await db
    .insert(userMarathons)
    .values(data)
    .returning({ id: userMarathons.id });
  return { id: result[0]?.id ?? null };
}

export async function updateUserMarathonRelationMutation(
  db: Database,
  {
    userId,
    marathonId,
    data,
  }: {
    userId: string;
    marathonId: number;
    data: Partial<Pick<NewUserMarathonRelation, "role">>;
  }
) {
  const result = await db
    .update(userMarathons)
    .set(data)
    .where(
      and(
        eq(userMarathons.userId, userId),
        eq(userMarathons.marathonId, marathonId)
      )
    )
    .returning({ id: userMarathons.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteUserMarathonRelationMutation(
  db: Database,
  { userId, marathonId }: { userId: string; marathonId: number }
) {
  const result = await db
    .delete(userMarathons)
    .where(
      and(
        eq(userMarathons.userId, userId),
        eq(userMarathons.marathonId, marathonId)
      )
    )
    .returning({ id: userMarathons.id });
  return { id: result[0]?.id ?? null };
}
