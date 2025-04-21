import { z } from "zod";

export const rulesFormSchema = z.object({
  max_file_size: z.object({
    enabled: z.boolean(),
    severity: z.string(),
    params: z.object({
      maxBytes: z.number(),
    }),
  }),
  allowed_file_types: z.object({
    enabled: z.boolean(),
    severity: z.string(),
    params: z.object({
      allowedFileTypes: z.array(z.string()),
    }),
  }),
  strict_timestamp_ordering: z.object({
    enabled: z.boolean(),
    severity: z.string(),
    params: z.null(),
  }),
  same_device: z.object({
    enabled: z.boolean(),
    severity: z.string(),
    params: z.null(),
  }),
  within_timerange: z.object({
    enabled: z.boolean(),
    severity: z.string(),
    params: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
  modified: z.object({
    enabled: z.boolean(),
    severity: z.string(),
    params: z.null(),
  }),
});

export type RulesFormValues = z.infer<typeof rulesFormSchema>;
