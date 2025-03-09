import { z } from "zod";
import { Icons } from "@/components/icons";

export const competitionClassSchema = z.object({
  name: z.string().min(1, "Name is required"),
  numberOfPhotos: z
    .number()
    .min(1, "Must upload at least 1 photo")
    .max(100, "Maximum 100 photos allowed"),
  icon: z.enum(Object.keys(Icons) as [string, ...string[]], {
    required_error: "Please select an icon",
  }),
});

export type CompetitionClass = z.infer<typeof competitionClassSchema>;
