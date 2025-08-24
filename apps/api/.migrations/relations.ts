import { relations } from "drizzle-orm/relations";
import { juryInvitations, juryRatings, marathons, participants, ruleConfigs, competitionClasses, deviceGroups, topics, user, account, session, userMarathons, validationResults, participantVerifications, submissions, zippedSubmissions, sponsors } from "./schema";

export const juryRatingsRelations = relations(juryRatings, ({one}) => ({
	juryInvitation: one(juryInvitations, {
		fields: [juryRatings.invitationId],
		references: [juryInvitations.id]
	}),
	marathon: one(marathons, {
		fields: [juryRatings.marathonId],
		references: [marathons.id]
	}),
	participant: one(participants, {
		fields: [juryRatings.participantId],
		references: [participants.id]
	}),
}));

export const juryInvitationsRelations = relations(juryInvitations, ({one, many}) => ({
	juryRatings: many(juryRatings),
	competitionClass: one(competitionClasses, {
		fields: [juryInvitations.competitionClassId],
		references: [competitionClasses.id]
	}),
	deviceGroup: one(deviceGroups, {
		fields: [juryInvitations.deviceGroupId],
		references: [deviceGroups.id]
	}),
	marathon: one(marathons, {
		fields: [juryInvitations.marathonId],
		references: [marathons.id]
	}),
	topic: one(topics, {
		fields: [juryInvitations.topicId],
		references: [topics.id]
	}),
}));

export const marathonsRelations = relations(marathons, ({many}) => ({
	juryRatings: many(juryRatings),
	ruleConfigs: many(ruleConfigs),
	juryInvitations: many(juryInvitations),
	participants: many(participants),
	userMarathons: many(userMarathons),
	competitionClasses: many(competitionClasses),
	deviceGroups: many(deviceGroups),
	submissions: many(submissions),
	topics: many(topics),
	zippedSubmissions: many(zippedSubmissions),
	sponsors: many(sponsors),
}));

export const participantsRelations = relations(participants, ({one, many}) => ({
	juryRatings: many(juryRatings),
	competitionClass: one(competitionClasses, {
		fields: [participants.competitionClassId],
		references: [competitionClasses.id]
	}),
	deviceGroup: one(deviceGroups, {
		fields: [participants.deviceGroupId],
		references: [deviceGroups.id]
	}),
	marathon: one(marathons, {
		fields: [participants.marathonId],
		references: [marathons.id]
	}),
	validationResults: many(validationResults),
	participantVerifications: many(participantVerifications),
	submissions: many(submissions),
	zippedSubmissions: many(zippedSubmissions),
}));

export const ruleConfigsRelations = relations(ruleConfigs, ({one}) => ({
	marathon: one(marathons, {
		fields: [ruleConfigs.marathonId],
		references: [marathons.id]
	}),
}));

export const competitionClassesRelations = relations(competitionClasses, ({one, many}) => ({
	juryInvitations: many(juryInvitations),
	participants: many(participants),
	marathon: one(marathons, {
		fields: [competitionClasses.marathonId],
		references: [marathons.id]
	}),
}));

export const deviceGroupsRelations = relations(deviceGroups, ({one, many}) => ({
	juryInvitations: many(juryInvitations),
	participants: many(participants),
	marathon: one(marathons, {
		fields: [deviceGroups.marathonId],
		references: [marathons.id]
	}),
}));

export const topicsRelations = relations(topics, ({one, many}) => ({
	juryInvitations: many(juryInvitations),
	submissions: many(submissions),
	marathon: one(marathons, {
		fields: [topics.marathonId],
		references: [marathons.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	userMarathons: many(userMarathons),
	participantVerifications: many(participantVerifications),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userMarathonsRelations = relations(userMarathons, ({one}) => ({
	marathon: one(marathons, {
		fields: [userMarathons.marathonId],
		references: [marathons.id]
	}),
	user: one(user, {
		fields: [userMarathons.userId],
		references: [user.id]
	}),
}));

export const validationResultsRelations = relations(validationResults, ({one}) => ({
	participant: one(participants, {
		fields: [validationResults.participantId],
		references: [participants.id]
	}),
}));

export const participantVerificationsRelations = relations(participantVerifications, ({one}) => ({
	user: one(user, {
		fields: [participantVerifications.staffId],
		references: [user.id]
	}),
	participant: one(participants, {
		fields: [participantVerifications.participantId],
		references: [participants.id]
	}),
}));

export const submissionsRelations = relations(submissions, ({one}) => ({
	marathon: one(marathons, {
		fields: [submissions.marathonId],
		references: [marathons.id]
	}),
	participant: one(participants, {
		fields: [submissions.participantId],
		references: [participants.id]
	}),
	topic: one(topics, {
		fields: [submissions.topicId],
		references: [topics.id]
	}),
}));

export const zippedSubmissionsRelations = relations(zippedSubmissions, ({one}) => ({
	marathon: one(marathons, {
		fields: [zippedSubmissions.marathonId],
		references: [marathons.id]
	}),
	participant: one(participants, {
		fields: [zippedSubmissions.participantId],
		references: [participants.id]
	}),
}));

export const sponsorsRelations = relations(sponsors, ({one}) => ({
	marathon: one(marathons, {
		fields: [sponsors.marathonId],
		references: [marathons.id]
	}),
}));