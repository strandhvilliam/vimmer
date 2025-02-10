import { z } from "zod";

export const initializeSubmissionsSchema = z.object({
  participantRef: z.string({ message: "Invalid participant reference" }),
  marathonDomain: z.string({ message: "Invalid marathon domain" }),
  participantId: z.number({ message: "Invalid participant id" }),
  competitionClassId: z.number({ message: "Invalid competition class id" }),
});
