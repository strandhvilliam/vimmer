import { z } from "zod";
export const readyParticipantSchema = z.object({
  participantId: z.number({ message: "Invalid participant id" }),
  deviceGroupId: z.number({ message: "Invalid device group id" }),
  competitionClassId: z.number({ message: "Invalid competition class id" }),
  firstname: z.string({ message: "Invalid firstname" }),
  lastname: z.string({ message: "Invalid lastname" }),
  email: z.string({ message: "Invalid email" }),
});
