import { relations } from "drizzle-orm/relations";
import {
  competitionClasses,
  participants,
  deviceGroups,
  marathons,
  user,
  account,
  ruleConfigs,
  session,
  userMarathons,
  validationResults,
  participantVerifications,
  submissions,
  topics,
  zippedSubmissions,
} from "./schema";

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
    zippedSubmissions: many(zippedSubmissions),
  })
);

export const competitionClassesRelations = relations(
  competitionClasses,
  ({ one, many }) => ({
    participants: many(participants),
    marathon: one(marathons, {
      fields: [competitionClasses.marathonId],
      references: [marathons.id],
    }),
  })
);

export const deviceGroupsRelations = relations(
  deviceGroups,
  ({ one, many }) => ({
    participants: many(participants),
    marathon: one(marathons, {
      fields: [deviceGroups.marathonId],
      references: [marathons.id],
    }),
  })
);

export const marathonsRelations = relations(marathons, ({ many }) => ({
  participants: many(participants),
  ruleConfigs: many(ruleConfigs),
  userMarathons: many(userMarathons),
  competitionClasses: many(competitionClasses),
  deviceGroups: many(deviceGroups),
  submissions: many(submissions),
  topics: many(topics),
  zippedSubmissions: many(zippedSubmissions),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  userMarathons: many(userMarathons),
  participantVerifications: many(participantVerifications),
}));

export const ruleConfigsRelations = relations(ruleConfigs, ({ one }) => ({
  marathon: one(marathons, {
    fields: [ruleConfigs.marathonId],
    references: [marathons.id],
  }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const userMarathonsRelations = relations(userMarathons, ({ one }) => ({
  marathon: one(marathons, {
    fields: [userMarathons.marathonId],
    references: [marathons.id],
  }),
  user: one(user, {
    fields: [userMarathons.userId],
    references: [user.id],
  }),
}));

export const validationResultsRelations = relations(
  validationResults,
  ({ one }) => ({
    participant: one(participants, {
      fields: [validationResults.participantId],
      references: [participants.id],
    }),
  })
);

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
);

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
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  submissions: many(submissions),
  marathon: one(marathons, {
    fields: [topics.marathonId],
    references: [marathons.id],
  }),
}));

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
);
