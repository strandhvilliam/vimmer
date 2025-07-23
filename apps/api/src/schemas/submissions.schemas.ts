import { z } from "zod/v4";

export const getSubmissionByIdSchema = z.object({
  id: z.number(),
});

export const getZippedSubmissionsByDomainSchema = z.object({
  marathonId: z.number(),
});

export const getManySubmissionsByKeysSchema = z.object({
  keys: z.array(z.string()),
});

export const getSubmissionsForJurySchema = z.object({
  domain: z.string(),
  competitionClassId: z.number().optional().nullable(),
  deviceGroupId: z.number().optional().nullable(),
  topicId: z.number().optional().nullable(),
});

export const getSubmissionsByParticipantIdSchema = z.object({
  participantId: z.number(),
});

export const createSubmissionSchema = z.object({
  data: z.object({
    participantId: z.number(),
    key: z.string(),
    thumbnailKey: z.string().optional(),
    previewKey: z.string().optional(),
    exif: z.any().optional(),
    marathonId: z.number(),
    metadata: z.any().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional(),
    topicId: z.number(),
    status: z.string().default("initialized"),
  }),
});

export const createMultipleSubmissionsSchema = z.object({
  data: z.array(
    z.object({
      participantId: z.number(),
      key: z.string(),
      thumbnailKey: z.string().optional(),
      previewKey: z.string().optional(),
      exif: z.any().optional(),
      marathonId: z.number(),
      metadata: z.any().optional(),
      size: z.number().optional(),
      mimeType: z.string().optional(),
      topicId: z.number(),
      status: z.string().default("initialized"),
    }),
  ),
});

export const updateSubmissionByKeySchema = z.object({
  key: z.string(),
  data: z.object({
    participantId: z.number().optional(),
    thumbnailKey: z.string().optional(),
    previewKey: z.string().optional(),
    exif: z.any().optional(),
    marathonId: z.number().optional(),
    metadata: z.any().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional(),
    topicId: z.number().optional(),
    status: z.string().optional(),
  }),
});

export const updateSubmissionByIdSchema = z.object({
  id: z.number(),
  data: z.object({
    participantId: z.number().optional(),
    key: z.string().optional(),
    thumbnailKey: z.string().optional(),
    previewKey: z.string().optional(),
    exif: z.any().optional(),
    marathonId: z.number().optional(),
    metadata: z.any().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional(),
    topicId: z.number().optional(),
    status: z.string().optional(),
  }),
});

export const createZippedSubmissionSchema = z.object({
  data: z.object({
    zipKey: z.string().optional(),
    marathonId: z.number(),
    exportType: z.string(),
    progress: z.number().default(0),
    status: z.string().default("pending"),
    participantId: z.number(),
    errors: z.any().optional(),
  }),
});

export const updateZippedSubmissionSchema = z.object({
  id: z.number(),
  data: z.object({
    zipKey: z.string().optional(),
    marathonId: z.number().optional(),
    exportType: z.string().optional(),
    progress: z.number().optional(),
    status: z.string().optional(),
    participantId: z.number().optional(),
    errors: z.any().optional(),
  }),
});

export const getZippedSubmissionsByParticipantRefSchema = z.object({
  domain: z.string(),
  participantRef: z.string(),
});
