import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, isNull, or, count, isNotNull } from "drizzle-orm";
import type { EmailParticipant, TestParticipant } from "../types/email.js";
import { marathons, participants } from "@vimmer/api/db/schema";
import type { Marathon } from "@vimmer/api/db/types";
// Define participants table schema inline since we don't have access to the schema here
import { pgTable, text, bigint, timestamp, boolean } from "drizzle-orm/pg-core";

// const participants = pgTable("participants", {
//   id: bigint("id", { mode: "number" })
//     .primaryKey()
//     .generatedByDefaultAsIdentity(),
//   createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
//     .defaultNow()
//     .notNull(),
//   updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
//   reference: text("reference").notNull(),
//   marathonId: bigint("marathon_id", { mode: "number" }),
//   competitionClassId: bigint("competition_class_id", { mode: "number" }),
//   deviceGroupId: bigint("device_group_id", { mode: "number" }),
//   email: text("email"),
//   status: text("status"),
//   firstname: text("firstname").default("").notNull(),
//   lastname: text("lastname").default("").notNull(),
//   contactSheetKey: text("contact_sheet_key"),
//   contactSheetSent: boolean("contact_sheet_sent"),
// })

const connectionString = process.env.DATABASE_URL || "";
const sql = postgres(connectionString);
const db = drizzle(sql);

export async function getVerifiedParticipantsWithContactSheets(
  marathonId: number,
  skipSent: boolean = true,
  limit?: number,
): Promise<EmailParticipant[]> {
  try {
    console.log(`🔍 Querying verified participants for marathon ${marathonId}`);

    let whereCondition = and(
      eq(participants.marathonId, marathonId),
      eq(participants.status, "verified"),
      // Only include participants with contact sheets
      isNotNull(participants.contactSheetKey),
    );

    if (skipSent) {
      whereCondition = and(
        whereCondition,
        or(
          eq(participants.contactSheetSent, false),
          isNull(participants.contactSheetSent),
        ),
      );
    }

    const query = db
      .select({
        id: participants.id,
        email: participants.email,
        firstname: participants.firstname,
        lastname: participants.lastname,
        reference: participants.reference,
        contactSheetKey: participants.contactSheetKey,
        contactSheetSent: participants.contactSheetSent,
        marathonId: participants.marathonId,
      })
      .from(participants)
      .where(whereCondition);

    if (limit) {
      query.limit(limit);
    }

    const result = await query;

    console.log(
      `✅ Found ${result.length} verified participants${skipSent ? " who haven't received emails yet" : ""}`,
    );

    return result.map((p) => ({
      id: p.id,
      email: p.email || "",
      firstname: p.firstname || "",
      lastname: p.lastname || "",
      reference: p.reference,
      contactSheetKey: p.contactSheetKey,
      contactSheetSent: p.contactSheetSent,
      marathonId: p.marathonId || 0,
    }));
  } catch (error) {
    console.error(
      `❌ Failed to query participants for marathon ${marathonId}:`,
      error,
    );
    throw error;
  }
}

export async function getParticipantById(
  participantId: number,
): Promise<EmailParticipant | null> {
  try {
    console.log(`🔍 Querying participant ${participantId}`);

    const result = await db
      .select({
        id: participants.id,
        email: participants.email,
        firstname: participants.firstname,
        lastname: participants.lastname,
        reference: participants.reference,
        contactSheetKey: participants.contactSheetKey,
        contactSheetSent: participants.contactSheetSent,
        marathonId: participants.marathonId,
      })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);

    if (result.length === 0) {
      console.log(`⚠️  Participant ${participantId} not found`);
      return null;
    }

    const p = result[0];
    if (!p) {
      return null;
    }

    return {
      id: p.id,
      email: p.email || "",
      firstname: p.firstname || "",
      lastname: p.lastname || "",
      reference: p.reference,
      contactSheetKey: p.contactSheetKey,
      contactSheetSent: p.contactSheetSent,
      marathonId: p.marathonId || 0,
    };
  } catch (error) {
    console.error(`❌ Failed to query participant ${participantId}:`, error);
    throw error;
  }
}

export async function markContactSheetAsSent(
  participantId: number,
): Promise<void> {
  try {
    await db
      .update(participants)
      .set({ contactSheetSent: true })
      .where(eq(participants.id, participantId));

    console.log(
      `✅ Marked participant ${participantId} as having received contact sheet`,
    );
  } catch (error) {
    console.error(`❌ Failed to update participant ${participantId}:`, error);
    throw error;
  }
}

export async function getMarathonEmailStats(marathonId: number): Promise<{
  totalVerified: number;
  contactSheetsSent: number;
  pending: number;
  withContactSheets: number;
}> {
  try {
    console.log(`📊 Getting email stats for marathon ${marathonId}`);

    const [totalVerifiedResult] = await db
      .select({ count: count(participants.id) })
      .from(participants)
      .where(
        and(
          eq(participants.marathonId, marathonId),
          eq(participants.status, "verified"),
        ),
      );

    const [sentEmailsResult] = await db
      .select({ count: count(participants.id) })
      .from(participants)
      .where(
        and(
          eq(participants.marathonId, marathonId),
          eq(participants.status, "verified"),
          eq(participants.contactSheetSent, true),
        ),
      );

    const [withContactSheetsResult] = await db
      .select({ count: count(participants.id) })
      .from(participants)
      .where(
        and(
          eq(participants.marathonId, marathonId),
          eq(participants.status, "verified"),
          isNull(participants.contactSheetKey),
        ),
      );

    const totalVerified = totalVerifiedResult?.count || 0;
    const sentEmails = sentEmailsResult?.count || 0;
    const withoutContactSheets = withContactSheetsResult?.count || 0;

    const stats = {
      totalVerified,
      contactSheetsSent: sentEmails,
      pending: totalVerified - sentEmails,
      withContactSheets: totalVerified - withoutContactSheets,
    };

    console.log(`📊 Marathon ${marathonId} stats:`, stats);
    return stats;
  } catch (error) {
    console.error(`❌ Failed to get stats for marathon ${marathonId}:`, error);
    throw error;
  }
}

export function getTestParticipants(limit: number = 5): TestParticipant[] {
  const testParticipants: TestParticipant[] = [
    {
      id: 9999,
      email: "strandh.villiam@gmail.com",
      firstname: "Villiam",
      lastname: "Strandh",
      reference: "0001",
      contactSheetKey: "sthlmtest/0001_v2.jpg",
    },
  ];

  return testParticipants.slice(0, limit);
}

export async function getMarathonData(marathonId: number): Promise<Marathon> {
  const [marathon] = await db
    .select()
    .from(marathons)
    .where(eq(marathons.id, marathonId));

  if (!marathon) {
    throw new Error("No marathon found");
  }

  return marathon;
}
