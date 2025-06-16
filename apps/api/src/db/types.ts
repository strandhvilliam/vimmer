import {
  deviceGroups,
  competitionClasses,
  participants,
  submissions,
  validationResults,
} from "./schema";

export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;

export type Submission = typeof submissions.$inferSelect;
export type NewSubmission = typeof submissions.$inferInsert;

export type ValidationResult = typeof validationResults.$inferSelect;
export type NewValidationResult = typeof validationResults.$inferInsert;

export type CompetitionClass = typeof competitionClasses.$inferSelect;
export type NewCompetitionClass = typeof competitionClasses.$inferInsert;

export type DeviceGroup = typeof deviceGroups.$inferSelect;
export type NewDeviceGroup = typeof deviceGroups.$inferInsert;
