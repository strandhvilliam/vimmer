import { z } from "zod/v4"

export const sponsorTypeEnum = z.enum([
  "contact-sheets",
  "participant-initial",
  "participant-success",
])

export const sponsorPositionEnum = z.enum(["bottom-right", "bottom-left", "top-right", "top-left"])

export const createSponsorSchema = z.object({
  marathonId: z.number(),
  type: sponsorTypeEnum,
  position: sponsorPositionEnum,
  key: z.string(),
})

export const updateSponsorSchema = z.object({
  id: z.number(),
  type: sponsorTypeEnum.optional(),
  position: sponsorPositionEnum.optional(),
  key: z.string().optional(),
})

export const deleteSponsorSchema = z.object({
  id: z.number(),
})

export const getSponsorsByMarathonSchema = z.object({
  marathonId: z.number(),
})

export const getSponsorsByTypeSchema = z.object({
  marathonId: z.number(),
  type: sponsorTypeEnum,
})

export const generateSponsorUploadUrlSchema = z.object({
  marathonId: z.number(),
  domain: z.string(),
  type: sponsorTypeEnum,
  position: sponsorPositionEnum,
})
