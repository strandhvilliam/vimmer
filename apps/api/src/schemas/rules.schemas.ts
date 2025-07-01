import { z } from "zod/v4";

export const getRulesByDomainSchema = z.object({
  domain: z.string(),
});

export const createRuleConfigSchema = z.object({
  data: z.object({
    ruleKey: z.string(),
    marathonId: z.number(),
    params: z.any().optional(),
    severity: z.string().default("warning"),
  }),
});

export const updateRuleConfigSchema = z.object({
  id: z.number(),
  data: z.object({
    ruleKey: z.string().optional(),
    marathonId: z.number().optional(),
    params: z.any().optional(),
    severity: z.string().optional(),
  }),
});

export const deleteRuleConfigSchema = z.object({
  id: z.number(),
});

export const updateMultipleRuleConfigSchema = z.object({
  domain: z.string(),
  data: z.array(
    z.object({
      ruleKey: z.string(),
      params: z.any().optional(),
      severity: z.string().optional(),
      enabled: z.boolean().optional(),
    })
  ),
});
