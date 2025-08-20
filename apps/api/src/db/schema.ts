import {
  pgTable,
  foreignKey,
  bigint,
  timestamp,
  smallint,
  text,
  jsonb,
  boolean,
  index,
  integer,
  unique,
  pgSequence,
  pgEnum,
} from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"

export const uploadStatus = pgEnum("upload_status", [
  "initialized",
  "processing",
  "error",
  "completed",
])

export const participantsIdSeq1 = pgSequence("participants_id_seq1", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
})
export const submissionsIdSeq1 = pgSequence("submissions_id_seq1", {
  startWith: "1",
  increment: "1",
  minValue: "1",
  maxValue: "9223372036854775807",
  cache: "1",
  cycle: false,
})

export const juryRatings = pgTable(
  "jury_ratings",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "jury_ratings_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    invitationId: bigint("invitation_id", { mode: "number" }).notNull(),
    rating: smallint().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    participantId: bigint("participant_id", { mode: "number" }).notNull(),
    notes: text().default(""),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.invitationId],
      foreignColumns: [juryInvitations.id],
      name: "jury_ratings_invitation_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "jury_ratings_marathon_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "jury_ratings_participant_id_fkey",
    }).onDelete("cascade"),
  ]
)

export const ruleConfigs = pgTable(
  "rule_configs",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "rule_configs_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    ruleKey: text("rule_key").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    params: jsonb(),
    severity: text().default("warning").notNull(),
    enabled: boolean().default(false).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "rule_configs_marathon_id_fkey",
    }),
  ]
)

export const participants = pgTable(
  "participants",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "participants_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    reference: text().notNull(),
    email: text(),
    uploadCount: integer("upload_count").default(0).notNull(),
    status: text().default("initialized").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    competitionClassId: bigint("competition_class_id", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    deviceGroupId: bigint("device_group_id", { mode: "number" }),
    domain: text().default("").notNull(),
    firstname: text().default("").notNull(),
    lastname: text().default("").notNull(),
    contactSheetKey: text("contact_sheet_key"),
    contactSheetSent: boolean("contact_sheet_sent").default(false).notNull(),
  },
  (table) => [
    index("participants_domain_idx").using(
      "btree",
      table.domain.asc().nullsLast().op("text_ops")
    ),
    index("participants_reference_domain_idx").using(
      "btree",
      table.reference.asc().nullsLast().op("text_ops"),
      table.domain.asc().nullsLast().op("text_ops")
    ),
    index("participants_reference_idx").using(
      "btree",
      table.reference.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.competitionClassId],
      foreignColumns: [competitionClasses.id],
      name: "participants_competition_class_id_fkey",
    }),
    foreignKey({
      columns: [table.deviceGroupId],
      foreignColumns: [deviceGroups.id],
      name: "participants_device_group_id_fkey",
    }),
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "participants_marathon_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const juryInvitations = pgTable("jury_invitations", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
    name: "jury_invitations_id_seq",
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: 9223372036854775807,
    cache: 1,
  }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
  status: text(),
  token: text().notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  email: text().notNull(),
  displayName: text("display_name").notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  topicId: bigint("topic_id", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  competitionClassId: bigint("competition_class_id", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  deviceGroupId: bigint("device_group_id", { mode: "number" }),
  notes: text(),
})

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ mode: "string" }),
    refreshTokenExpiresAt: timestamp({ mode: "string" }),
    scope: text(),
    password: text(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_userId_fkey",
    }),
  ]
)

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp({ mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text().notNull(),
    impersonatedBy: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_userId_fkey",
    }),
    unique("session_token_key").on(table.token),
  ]
)

export const userMarathons = pgTable(
  "user_marathons",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "user_marathons_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    role: text().default("staff").notNull(),
    userId: text("user_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "user_marathons_marathon_id_fkey",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_marathons_user_id_fkey",
    }),
  ]
)

export const validationResults = pgTable(
  "validation_results",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "validation_results_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    outcome: text().notNull(),
    ruleKey: text("rule_key").notNull(),
    message: text().notNull(),
    fileName: text("file_name"),
    severity: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    participantId: bigint("participant_id", { mode: "number" }).notNull(),
    overruled: boolean().default(false).notNull(),
  },
  (table) => [
    index("validation_results_participant_id_idx").using(
      "btree",
      table.participantId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "validation_results_participant_id_fkey",
    }).onDelete("cascade"),
  ]
)

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp({ mode: "string" }).notNull(),
  createdAt: timestamp({ mode: "string" }),
  updatedAt: timestamp({ mode: "string" }),
})

export const marathons = pgTable(
  "marathons",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "marathon_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    domain: text().notNull(),
    name: text().notNull(),
    startDate: timestamp("start_date", { withTimezone: true, mode: "string" }),
    endDate: timestamp("end_date", { withTimezone: true, mode: "string" }),
    logoUrl: text("logo_url"),
    description: text(),
    languages: text().default("en").notNull(),
    setupCompleted: boolean("setup_completed").default(false),
    termsAndConditionsKey: text("terms_and_conditions_key"),
  },
  (table) => [
    index("marathons_domain_idx").using(
      "btree",
      table.domain.asc().nullsLast().op("text_ops")
    ),
  ]
)

export const competitionClasses = pgTable(
  "competition_classes",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "competition_class_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    name: text().notNull(),
    numberOfPhotos: integer("number_of_photos").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    topicStartIndex: integer("topic_start_index").default(0).notNull(),
    description: text(),
  },
  (table) => [
    index("competition_classes_marathon_id_idx").using(
      "btree",
      table.marathonId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "competition_classes_marathon_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const deviceGroups = pgTable(
  "device_groups",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "device_group_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    name: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    icon: text().default("camera").notNull(),
    description: text(),
  },
  (table) => [
    index("device_groups_marathon_id_idx").using(
      "btree",
      table.marathonId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "device_groups_marathon_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const participantVerifications = pgTable(
  "participant_verifications",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "participant_verification_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    participantId: bigint("participant_id", { mode: "number" }).notNull(),
    staffId: text("staff_id").notNull(),
    notes: text(),
  },
  (table) => [
    index("participant_verifications_staff_id_idx").using(
      "btree",
      table.staffId.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.staffId],
      foreignColumns: [user.id],
      name: "participant_verification_staff_id_fkey",
    }),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "participant_verifications_participant_id_fkey",
    }).onDelete("cascade"),
  ]
)

export const submissions = pgTable(
  "submissions",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "submissions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    participantId: bigint("participant_id", { mode: "number" }).notNull(),
    key: text().notNull(),
    thumbnailKey: text("thumbnail_key"),
    previewKey: text("preview_key"),
    exif: jsonb(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    metadata: jsonb(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    size: bigint({ mode: "number" }),
    mimeType: text("mime_type"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    topicId: bigint("topic_id", { mode: "number" }).notNull(),
    status: text().default("initialized").notNull(),
  },
  (table) => [
    index("submissions_key_idx").using(
      "btree",
      table.key.asc().nullsLast().op("text_ops")
    ),
    index("submissions_marathon_id_idx").using(
      "btree",
      table.marathonId.asc().nullsLast().op("int8_ops")
    ),
    index("submissions_participant_id_idx").using(
      "btree",
      table.participantId.asc().nullsLast().op("int8_ops")
    ),
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "submissions_marathon_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "submissions_participant_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.topicId],
      foreignColumns: [topics.id],
      name: "submissions_topic_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const topics = pgTable(
  "topics",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "topics_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    name: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    orderIndex: integer("order_index").default(0).notNull(),
    visibility: text().default("private").notNull(),
    scheduledStart: timestamp("scheduled_start", {
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => [
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "topics_marathon_id_fkey",
    })
      .onUpdate("cascade")
      .onDelete("cascade"),
  ]
)

export const zippedSubmissions = pgTable(
  "zipped_submissions",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "zipped_submissions_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    zipKey: text("zip_key"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
    exportType: text("export_type").notNull(),
    progress: integer().default(0).notNull(),
    status: text().default("pending").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    participantId: bigint("participant_id", { mode: "number" }).notNull(),
    errors: jsonb(),
  },
  (table) => [
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "zipped_submissions_marathon_id_fkey",
    }),
    foreignKey({
      columns: [table.participantId],
      foreignColumns: [participants.id],
      name: "zipped_submissions_participant_id_fkey",
    }).onDelete("cascade"),
  ]
)

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    createdAt: timestamp({ mode: "string" }).notNull(),
    updatedAt: timestamp({ mode: "string" }).notNull(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({ mode: "string" }),
  },
  (table) => [unique("user_email_key").on(table.email)]
)

export const sponsors = pgTable(
  "sponsors",
  {
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({
      name: "sponsors_id_seq",
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 9223372036854775807,
      cache: 1,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    uploadedAt: timestamp("uploaded_at", {
      withTimezone: true,
      mode: "string",
    }),
    key: text().notNull(),
    position: text().notNull(),
    type: text().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    marathonId: bigint("marathon_id", { mode: "number" }).notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.marathonId],
      foreignColumns: [marathons.id],
      name: "sponsors_marathon_id_fkey",
    }).onDelete("cascade"),
  ]
)

export const participantsRelations = relations(
  participants,
  ({ one, many }) => ({
    competitionClass: one(competitionClasses, {
      fields: [participants.competitionClassId],
      references: [competitionClasses.id],
    }),
    deviceGroup: one(deviceGroups, {
      fields: [participants.deviceGroupId],
      references: [deviceGroups.id],
    }),
    marathon: one(marathons, {
      fields: [participants.marathonId],
      references: [marathons.id],
    }),
    validationResults: many(validationResults),
    participantVerifications: many(participantVerifications),
    submissions: many(submissions),
    zippedSubmission: one(zippedSubmissions),
  })
)

export const competitionClassesRelations = relations(
  competitionClasses,
  ({ one, many }) => ({
    participants: many(participants),
    juryInvitations: many(juryInvitations),
    marathon: one(marathons, {
      fields: [competitionClasses.marathonId],
      references: [marathons.id],
    }),
  })
)

export const deviceGroupsRelations = relations(
  deviceGroups,
  ({ one, many }) => ({
    participants: many(participants),
    juryInvitations: many(juryInvitations),
    marathon: one(marathons, {
      fields: [deviceGroups.marathonId],
      references: [marathons.id],
    }),
  })
)

export const marathonsRelations = relations(marathons, ({ many }) => ({
  participants: many(participants),
  ruleConfigs: many(ruleConfigs),
  userMarathons: many(userMarathons),
  competitionClasses: many(competitionClasses),
  deviceGroups: many(deviceGroups),
  submissions: many(submissions),
  topics: many(topics),
  zippedSubmissions: many(zippedSubmissions),
  juryInvitations: many(juryInvitations),
  sponsors: many(sponsors),
}))

export const userRelations = relations(user, ({ many }) => ({
  userMarathons: many(userMarathons),
  participantVerifications: many(participantVerifications),
}))

export const ruleConfigsRelations = relations(ruleConfigs, ({ one }) => ({
  marathon: one(marathons, {
    fields: [ruleConfigs.marathonId],
    references: [marathons.id],
  }),
}))

export const userMarathonsRelations = relations(userMarathons, ({ one }) => ({
  marathon: one(marathons, {
    fields: [userMarathons.marathonId],
    references: [marathons.id],
  }),
  user: one(user, {
    fields: [userMarathons.userId],
    references: [user.id],
  }),
}))

export const validationResultsRelations = relations(
  validationResults,
  ({ one }) => ({
    participant: one(participants, {
      fields: [validationResults.participantId],
      references: [participants.id],
    }),
  })
)

export const participantVerificationsRelations = relations(
  participantVerifications,
  ({ one }) => ({
    participant: one(participants, {
      fields: [participantVerifications.participantId],
      references: [participants.id],
    }),
    user: one(user, {
      fields: [participantVerifications.staffId],
      references: [user.id],
    }),
  })
)

export const submissionsRelations = relations(submissions, ({ one }) => ({
  marathon: one(marathons, {
    fields: [submissions.marathonId],
    references: [marathons.id],
  }),
  participant: one(participants, {
    fields: [submissions.participantId],
    references: [participants.id],
  }),
  topic: one(topics, {
    fields: [submissions.topicId],
    references: [topics.id],
  }),
}))

export const topicsRelations = relations(topics, ({ one, many }) => ({
  submissions: many(submissions),
  juryInvitations: many(juryInvitations),
  marathon: one(marathons, {
    fields: [topics.marathonId],
    references: [marathons.id],
  }),
}))

export const zippedSubmissionsRelations = relations(
  zippedSubmissions,
  ({ one }) => ({
    marathon: one(marathons, {
      fields: [zippedSubmissions.marathonId],
      references: [marathons.id],
    }),
    participant: one(participants, {
      fields: [zippedSubmissions.participantId],
      references: [participants.id],
    }),
  })
)

export const juryInvitationsRelations = relations(
  juryInvitations,
  ({ one, many }) => ({
    marathon: one(marathons, {
      fields: [juryInvitations.marathonId],
      references: [marathons.id],
    }),
    topic: one(topics, {
      fields: [juryInvitations.topicId],
      references: [topics.id],
    }),
    competitionClass: one(competitionClasses, {
      fields: [juryInvitations.competitionClassId],
      references: [competitionClasses.id],
    }),
    deviceGroup: one(deviceGroups, {
      fields: [juryInvitations.deviceGroupId],
      references: [deviceGroups.id],
    }),
    juryRatings: many(juryRatings),
  })
)

export const sponsorsRelations = relations(sponsors, ({ one }) => ({
  marathon: one(marathons, {
    fields: [sponsors.marathonId],
    references: [marathons.id],
  }),
}))

export const juryRatingsRelations = relations(juryRatings, ({ one }) => ({
  juryInvitation: one(juryInvitations, {
    fields: [juryRatings.invitationId],
    references: [juryInvitations.id],
  }),
  participant: one(participants, {
    fields: [juryRatings.participantId],
    references: [participants.id],
  }),
}))
