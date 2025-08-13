import { z } from "zod/v4"

export const generatePresignedUrlsSchema = z.object({
  participantRef: z.string().min(1),
  domain: z.string().min(1),
  participantId: z.number().min(1),
  competitionClassId: z.number().min(1),
  preconvertedExifData: z
    .array(z.object({ orderIndex: z.number(), exif: z.any() }))
    .optional(),
})

export type GeneratePresignedUrlsInput = z.infer<
  typeof generatePresignedUrlsSchema
>
