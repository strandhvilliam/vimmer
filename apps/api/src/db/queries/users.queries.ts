import { eq, and } from "drizzle-orm";
import type { Database, IdResponse } from "@/db";
import {
  user,
  userMarathons,
  marathons,
  participantVerifications,
} from "@/db/schema";
import type {
  User,
  NewUser,
  UserMarathonRelation,
  NewUserMarathonRelation,
  Marathon,
  ParticipantVerification,
} from "@/db/types";

interface UserWithMarathonsResponse extends User {
  userMarathons: (UserMarathonRelation & {
    marathon: Marathon;
  })[];
}

interface UserWithMarathonsSimpleResponse extends User {
  userMarathons: UserMarathonRelation[];
}

interface StaffMemberResponse extends UserMarathonRelation {
  user: User;
}

interface StaffMemberWithVerificationsResponse extends UserMarathonRelation {
  user: User & {
    participantVerifications: ParticipantVerification[];
  };
}

export async function getUserWithMarathonsQuery(
  db: Database,
  { userId }: { userId: string }
): Promise<UserWithMarathonsResponse | null> {
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
): Promise<Marathon[]> {
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
): Promise<UserWithMarathonsSimpleResponse | null> {
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
): Promise<StaffMemberResponse[]> {
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
  { staffId, marathonId }: { staffId: string; marathonId: number }
): Promise<StaffMemberWithVerificationsResponse | null> {
  const result = await db.query.userMarathons.findFirst({
    where: and(
      eq(userMarathons.userId, staffId),
      eq(userMarathons.marathonId, marathonId)
    ),
    with: {
      user: {
        with: {
          participantVerifications: true,
        },
      },
    },
  });

  return result ?? null;
}

export async function createUserMutation(
  db: Database,
  { data }: { data: NewUser }
): Promise<{ id: string | null }> {
  const result = await db.insert(user).values(data).returning({ id: user.id });
  return { id: result[0]?.id ?? null };
}

export async function updateUserMutation(
  db: Database,
  { id, data }: { id: string; data: Partial<NewUser> }
): Promise<{ id: string | null }> {
  const result = await db
    .update(user)
    .set(data)
    .where(eq(user.id, id))
    .returning({ id: user.id });
  return { id: result[0]?.id ?? null };
}

export async function deleteUserMutation(
  db: Database,
  { id }: { id: string }
): Promise<{ id: string | null }> {
  const result = await db
    .delete(user)
    .where(eq(user.id, id))
    .returning({ id: user.id });
  return { id: result[0]?.id ?? null };
}

export async function createUserMarathonRelationMutation(
  db: Database,
  { data }: { data: NewUserMarathonRelation }
): Promise<IdResponse> {
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
): Promise<IdResponse | null> {
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
): Promise<IdResponse | null> {
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
