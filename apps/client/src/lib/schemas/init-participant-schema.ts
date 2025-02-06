import { z } from "zod";

export const initParticipantSchema = z.object({
  participantRef: z
    .string()
    .nonempty({ message: "Participant reference is required." })
    .refine((val) => /^\d+$/.test(val), {
      message: "Only numbers are allowed.",
    })
    .refine(
      (val) => {
        console.log(val.length === 4);
        return val.length === 4;
      },
      {
        message: `Must be exactly ${4} digits.`,
      },
    ),
  marathonId: z.number().min(1, "Invalid marathon ID"),
});
